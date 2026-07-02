// Injects the shared sidebar. Requires firebase-config.js to be loaded first.
function loadSidebar(activeTab) {
    const nav = [
        { tab: 'dashboard',    icon: 'fa-chart-pie',    label: 'Dashboard',      href: '../dashboard/dashboard.php' },
        { tab: 'services',     icon: 'fa-file-alt',     label: 'Services',       href: '../services/services.php' },
        { tab: 'announcement', icon: 'fa-bullhorn',     label: 'Announcement',   href: '../announcement/announcement.php' },
        { tab: 'calendar',     icon: 'fa-calendar-alt', label: 'Calendar Event', href: '../calendar/calendar.php' },
        { tab: 'residents',    icon: 'fa-users',        label: 'Residents',      href: '../residents/residents.php' },
        { tab: 'settings',     icon: 'fa-cog',          label: 'Settings',       href: '../settings/settings.php' },
        { tab: 'admin',        icon: 'fa-shield-alt',   label: 'Admin Panel',    href: '../admin/admin.php' },
    ];

    const el = document.getElementById('sidebarMount');
    if (!el) return;

    // auth.currentUser is already set because loadSidebar is called inside requireAuth
    const user = auth.currentUser;

    // Use Auth display name immediately — no flash, no "Loading..."
    const quickName = user
        ? (user.displayName || user.email.split('@')[0])
        : '';

    el.innerHTML = `
        <div class="profile-summary" id="profileSummary" onclick="window.location.href='../dashboard/dashboard.php'">
            <div class="avatar-icon" id="sidebarAvatar"><i class="fas fa-user-circle"></i></div>
            <h3 id="sidebarName">${quickName}</h3>
            <span class="resident-id" id="sidebarRole"><i class="fas fa-id-badge"></i> Resident</span>
        </div>
        <div class="sidebar-nav">
            <ul id="sidebarNavList">
                ${nav.map(n => `
                <li class="nav-item ${n.tab === activeTab ? 'active' : ''}"
                    onclick="window.location.href='${n.href}'">
                    <i class="fas ${n.icon}"></i> ${n.label}
                </li>`).join('')}
            </ul>
        </div>`;

    // Load full name and role from Firestore in the background
    if (user) {
        db.collection('users').doc(user.uid).get().then(snap => {
            if (!snap.exists) return;
            const data = snap.data();

            const fullName = data.firstName
                ? `${data.firstName} ${data.lastName || ''}`.trim()
                : quickName;

            const isAdmin  = data.role === 'admin';
            const roleIcon = isAdmin ? 'fa-shield-alt' : 'fa-id-badge';
            const roleText = isAdmin ? 'Administrator' : 'Resident';

            document.getElementById('sidebarName').innerText = fullName;
            document.getElementById('sidebarRole').innerHTML =
                `<i class="fas ${roleIcon}"></i> ${roleText}`;

            // Show initials in avatar
            const initials = ((data.firstName || '')[0] || '') +
                             ((data.lastName  || '')[0] || '');
            if (initials) {
                document.getElementById('sidebarAvatar').innerHTML =
                    `<span style="font-size:1.4rem;font-weight:700;color:#be185d;">${initials.toUpperCase()}</span>`;
            }

            // Hide Admin Panel for non-admins
            if (!isAdmin) {
                document.querySelectorAll('#sidebarNavList .nav-item').forEach(li => {
                    if (li.innerText.trim().includes('Admin Panel')) li.style.display = 'none';
                });
            }
        }).catch(e => console.warn('Sidebar profile error:', e));
    }
}
