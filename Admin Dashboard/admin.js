import {
  db,
  auth,
  onAuthStateChanged,
  collection,
  getDocs,
  updateDoc,
  doc,
} from "../Firebase/config.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/login";
    return;
  }

  const usersList = document.getElementById("users");
  const loadingSpinner = document.getElementById("loadingSpinner");
  const noUsersMessage = document.getElementById("noUsersMessage");
  const verifiedCount = document.getElementById("verifiedCount");
  const unverifiedCount = document.getElementById("unverifiedCount");
  const searchInput = document.getElementById("searchInput");
  const filterSelect = document.getElementById("filterSelect");

  let allUsers = [];
  let filteredUsers = [];

  usersList.innerHTML = "";
  loadingSpinner.style.display = "block";
  noUsersMessage.style.display = "none";

  const snap = await getDocs(collection(db, "users"));

  loadingSpinner.style.display = "none";

  if (snap.empty) {
    noUsersMessage.style.display = "block";
    return;
  }

  let verified = 0;
  let unverified = 0;

  snap.forEach((u) => {
    const data = u.data();

    if (data.isVerified) {
      verified++;
    } else {
      unverified++;
    }

    allUsers.push({
      id: u.id,
      ...data,
    });
  });

  verifiedCount.textContent = verified;
  unverifiedCount.textContent = unverified;

  filteredUsers = [...allUsers];
  renderUsers();

  searchInput.addEventListener("input", () => {
    filterUsers();
  });

  filterSelect.addEventListener("change", () => {
    filterUsers();
  });

  function filterUsers() {
    const searchTerm = searchInput.value.toLowerCase();
    const filterValue = filterSelect.value;

    filteredUsers = allUsers.filter((user) => {
      const matchesSearch =
        user.fullName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm);

      let matchesFilter = true;
      if (filterValue === "verified") {
        matchesFilter = user.isVerified === true;
      } else if (filterValue === "unverified") {
        matchesFilter = user.isVerified === false;
      }

      return matchesSearch && matchesFilter;
    });

    renderUsers();
  }

  function renderUsers() {
    usersList.innerHTML = "";

    if (filteredUsers.length === 0) {
      noUsersMessage.style.display = "block";
      return;
    }

    noUsersMessage.style.display = "none";

    filteredUsers.forEach((user) => {
      const row = document.createElement("tr");

      const nameCell = document.createElement("td");
      nameCell.className = "user-name";
      nameCell.textContent = user.fullName;

      const emailCell = document.createElement("td");
      emailCell.className = "user-email";
      emailCell.textContent = user.email;

      const statusCell = document.createElement("td");
      const statusBadge = document.createElement("span");
      statusBadge.className = `status-badge ${user.isVerified ? "status-verified" : "status-unverified"}`;
      statusBadge.textContent = user.isVerified ? "Verified" : "Unverified";
      statusCell.appendChild(statusBadge);

      const actionCell = document.createElement("td");
      const toggleBtn = document.createElement("button");
      toggleBtn.className = `btn-toggle ${user.isVerified ? "btn-unverify" : "btn-verify"}`;
      toggleBtn.textContent = user.isVerified ? "Unverify" : "Verify";

      toggleBtn.onclick = async () => {
        try {
          await updateDoc(doc(db, "users", user.id), {
            isVerified: !user.isVerified,
          });

          Swal.fire({
            icon: "success",
            title: "Status Updated",
            text: `User has been ${!user.isVerified ? "verified" : "unverified"} successfully`,
            confirmButtonColor: "#FF6B35",
          });

          user.isVerified = !user.isVerified;

          if (user.isVerified) {
            verified++;
            unverified--;
          } else {
            verified--;
            unverified++;
          }

          verifiedCount.textContent = verified;
          unverifiedCount.textContent = unverified;

          filterUsers();
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Update Failed",
            text: "There was an error updating the user status",
            confirmButtonColor: "#FF6B35",
          });
        }
      };

      actionCell.appendChild(toggleBtn);

      row.appendChild(nameCell);
      row.appendChild(emailCell);
      row.appendChild(statusCell);
      row.appendChild(actionCell);

      usersList.appendChild(row);
    });
  }

  document.getElementById("logoutBtn").addEventListener("click", async () => {
    try {
      await auth.signOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  });

  document.getElementById("currentYear").textContent = new Date().getFullYear();
});
