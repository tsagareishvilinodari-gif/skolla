/**
 * бѓ“бѓђбѓ›бѓ бѓбѓ’бѓ”бѓ‘бѓљбѓбѓЎ бѓџбѓЈбѓ бѓњбѓђбѓљбѓ - Core Application Logic
 * 2026-2027 бѓЎбѓђбѓЎбѓ¬бѓђбѓ•бѓљбѓќ бѓ¬бѓ”бѓљбѓ
 */

// Global Application State
let appState = null;
let currentView = 'dashboard';
let activeStudentIdForChar = 1;
let selectedAttendanceMonth = 'бѓњбѓќбѓ”бѓ›бѓ‘бѓ”бѓ бѓ';
let chartType = 'subjects'; // 'subjects', 'distribution', 'ranking'

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  initRouting();
  renderNavigation();
  renderCurrentView();
  setupEventListeners();
  initRechartsOrFallback();
});

// Load state from localStorage or DEFAULT_DATA
function loadState() {
  const saved = localStorage.getItem('damrigeblis_zhurnali_2026_2027');
  if (saved) {
    try {
      appState = JSON.parse(saved);
      // Validate structure integrity
      if (!appState.students || !appState.attendance || !appState.grades) {
        throw new Error('Incomplete data');
      }
    } catch (e) {
      console.warn('Error parsing saved state, resetting to default:', e);
      appState = JSON.parse(JSON.stringify(DEFAULT_DATA));
    }
  } else {
    appState = JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
}

// Save state to localStorage and display toast
function saveState(silent = false) {
  try {
    localStorage.setItem('damrigeblis_zhurnali_2026_2027', JSON.stringify(appState));
    if (!silent) {
      showToast('бѓ›бѓќбѓњбѓђбѓЄбѓ”бѓ›бѓ”бѓ‘бѓ бѓ¬бѓђбѓ бѓ›бѓђбѓўбѓ”бѓ‘бѓбѓ— бѓЁбѓ”бѓбѓњбѓђбѓ®бѓђ');
    }
  } catch (e) {
    console.error('Error saving state:', e);
    showToast('бѓЁбѓ”бѓњбѓђбѓ®бѓ•бѓбѓЎбѓђбѓЎ бѓ“бѓђбѓ¤бѓбѓҐбѓЎбѓбѓ бѓ“бѓђ бѓЁбѓ”бѓЄбѓ“бѓќбѓ›бѓђ', true);
  }
}

// Reset to Default Sample Data
function resetToDefaults() {
  if (confirm('бѓ“бѓђбѓ бѓ¬бѓ›бѓЈбѓњбѓ”бѓ‘бѓЈбѓљбѓ бѓ®бѓђбѓ бѓ—, бѓ бѓќбѓ› бѓ’бѓЎбѓЈбѓ бѓ— бѓЎбѓђбѓ¬бѓ§бѓбѓЎбѓ (бѓ“бѓ”бѓ›бѓќ) бѓ›бѓќбѓњбѓђбѓЄбѓ”бѓ›бѓ”бѓ‘бѓбѓЎ бѓђбѓ¦бѓ“бѓ’бѓ”бѓњбѓђ? бѓ§бѓ•бѓ”бѓљбѓђ бѓЁбѓ”бѓ§бѓ•бѓђбѓњбѓбѓљбѓ бѓЄбѓ•бѓљбѓбѓљбѓ”бѓ‘бѓђ бѓ’бѓђбѓ“бѓђбѓбѓ¬бѓ”бѓ бѓ”бѓ‘бѓђ.')) {
    localStorage.removeItem('damrigeblis_zhurnali_2026_2027');
    appState = JSON.parse(JSON.stringify(DEFAULT_DATA));
    saveState(true);
    renderCurrentView();
    showToast('бѓЎбѓђбѓ¬бѓ§бѓбѓЎбѓ бѓ›бѓќбѓњбѓђбѓЄбѓ”бѓ›бѓ”бѓ‘бѓ бѓђбѓ¦бѓ“бѓ’бѓ”бѓњбѓбѓљбѓбѓђ');
  }
}

// Export Data as JSON
function exportDataJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `damrigeblis_zhurnali_2026_2027_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('бѓ¤бѓђбѓбѓљбѓ бѓ©бѓђбѓ›бѓќбѓбѓўбѓ•бѓбѓ бѓ—бѓђ');
}

// Import Data from JSON
function triggerImportJSON() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported.students && imported.attendance) {
          appState = imported;
          saveState(true);
          renderCurrentView();
          showToast('бѓ›бѓќбѓњбѓђбѓЄбѓ”бѓ›бѓ”бѓ‘бѓ бѓ¬бѓђбѓ бѓ›бѓђбѓўбѓ”бѓ‘бѓбѓ— бѓ©бѓђбѓбѓўбѓ•бѓбѓ бѓ—бѓђ');
        } else {
          alert('бѓђбѓ бѓђбѓЎбѓ¬бѓќбѓ бѓ бѓ¤бѓђбѓбѓљбѓбѓЎ бѓ¤бѓќбѓ бѓ›бѓђбѓўбѓ');
        }
      } catch (err) {
        alert('бѓ¤бѓђбѓбѓљбѓбѓЎ бѓ¬бѓђбѓ™бѓбѓ—бѓ®бѓ•бѓђ бѓ•бѓ”бѓ  бѓ›бѓќбѓ®бѓ”бѓ бѓ®бѓ“бѓђ: ' + err.message);
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// Toast notification
function showToast(message, isError = false) {
  let toast = document.getElementById('toastNotification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotification';
    toast.className = 'fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg font-medium text-sm transition-all duration-300 transform translate-y-10 opacity-0';
    document.body.appendChild(toast);
  }

  toast.innerHTML = isError 
    ? `<svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> <span>${message}</span>`
    : `<svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> <span>${message}</span>`;
  
  toast.className = `fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl font-medium text-sm transition-all duration-300 transform translate-y-0 opacity-100 ${isError ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-slate-900 text-white border border-slate-700'}`;

  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-10', 'opacity-0');
  }, 2800);
}

// Routing & View Navigation
function initRouting() {
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && hash !== currentView) {
      navigateTo(hash, false);
    }
  });

  const initialHash = window.location.hash.replace('#', '');
  if (initialHash) {
    currentView = initialHash;
  }
}

function navigateTo(viewName, updateHash = true) {
  currentView = viewName;
  if (updateHash) {
    window.location.hash = viewName;
  }
  renderNavigation();
  renderCurrentView();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Render Top Navigation Bar & Breadcrumb
function renderNavigation() {
  const sections = [
    { id: 'dashboard', name: 'бѓ›бѓ—бѓђбѓ•бѓђбѓ бѓ', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'students', name: 'бѓ›бѓќбѓЎбѓ¬бѓђбѓ•бѓљбѓ”бѓ—бѓђ бѓ›бѓќбѓњбѓђбѓЄбѓ”бѓ›бѓ”бѓ‘бѓ', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: 'calendar', name: 'бѓЎбѓђбѓЎбѓ™бѓќбѓљбѓќ бѓ™бѓђбѓљбѓ”бѓњбѓ“бѓђбѓ бѓ', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'action-plan', name: 'бѓЎбѓђбѓ›бѓќбѓҐбѓ›бѓ”бѓ“бѓќ бѓ’бѓ”бѓ’бѓ›бѓђ', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { id: 'homeroom-hours', name: 'бѓ“бѓђбѓ›бѓ бѓбѓ’бѓ”бѓ‘бѓљбѓбѓЎ бѓЎбѓђбѓђбѓ—бѓ', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'attendance', name: 'бѓ“бѓђбѓЎбѓ¬бѓ бѓ”бѓ‘бѓбѓЎ бѓђбѓ¦бѓ бѓбѓЄбѓ®бѓ•бѓђ', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'teachers', name: 'бѓЎбѓђбѓ’бѓњбѓ”бѓ‘бѓ бѓ“бѓђ бѓ›бѓђбѓЎбѓ¬бѓђбѓ•бѓљбѓ”бѓ‘бѓљбѓ”бѓ‘бѓ', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { id: 'grades', name: 'бѓђбѓ™бѓђбѓ“бѓ”бѓ›бѓбѓЈбѓ бѓ бѓ›бѓќбѓЎбѓ¬бѓ бѓ”бѓ‘бѓђ', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'characterization', name: 'бѓ›бѓќбѓЎбѓ¬бѓђбѓ•бѓљбѓбѓЎ бѓ“бѓђбѓ®бѓђбѓЎбѓбѓђбѓ—бѓ”бѓ‘бѓђ', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'standards', name: 'бѓЎбѓђбѓ’бѓњбѓќбѓ‘бѓ бѓбѓ•бѓ бѓЎбѓўбѓђбѓњбѓ“бѓђбѓ бѓўбѓ', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' }
  ];

  // Update Breadcrumb
  const currentSectionObj = sections.find(s => s.id === currentView) || sections[0];
  const breadcrumbEl = document.getElementById('breadcrumbContainer');
  if (breadcrumbEl) {
    breadcrumbEl.innerHTML = `
      <div class="flex items-center gap-2 text-sm text-slate-500 font-medium">
        <button onclick="navigateTo('dashboard')" class="hover:text-indigo-600 transition flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          бѓ›бѓ—бѓђбѓ•бѓђбѓ бѓ
        </button>
        ${currentView !== 'dashboard' ? `
          <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          <span class="text-slate-900 font-semibold">${currentSectionObj.name}</span>
        ` : ''}
      </div>
    `;
  }

  // Update Section Title & Back Button in Header
  const titleContainer = document.getElementById('headerTitleContainer');
  if (titleContainer) {
    titleContainer.innerHTML = `
      <div class="flex items-center justify-between w-full">
        <div>
          <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span class="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${currentSectionObj.icon}"/></svg>
            </span>
            ${currentSectionObj.name}
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
            ${appState.schoolInfo.className} вЂў ${appState.schoolInfo.advisor} вЂў ${appState.schoolInfo.academicYear}
          </p>
        </div>
        ${currentView !== 'dashboard' ? `
          <button onclick="navigateTo('dashboard')" class="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            бѓ›бѓ—бѓђбѓ•бѓђбѓ бѓ–бѓ” бѓ“бѓђбѓ‘бѓ бѓЈбѓњбѓ”бѓ‘бѓђ
          </button>
        ` : ''}
      </div>
    `;
  }

  // Render Horizontal Quick Tabs
  const quickNavEl = document.getElementById('quickNavTabs');
  if (quickNavEl) {
    quickNavEl.innerHTML = sections.map(sec => {
      const isActive = sec.id === currentView;
      return `
        <button onclick="navigateTo('${sec.id}')" 
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
            isActive 
              ? 'bg-indigo-600 text-white shadow-sm font-semibold' 
              : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/70'
          }">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${sec.icon}"/></svg>
          <span>${sec.name}</span>
        </button>
      `;
    }).join('');
  }
}

// Render the active view
function renderCurrentView() {
  const container = document.getElementById('mainContent');
  if (!container) return;

  switch (currentView) {
    case 'dashboard':
      container.innerHTML = renderDashboardView();
      break;
    case 'students':
      container.innerHTML = renderStudentsView();
      break;
    case 'calendar':
      container.innerHTML = renderCalendarView();
      break;
    case 'action-plan':
      container.innerHTML = renderActionPlanView();
      break;
    case 'homeroom-hours':
      container.innerHTML = renderHomeroomHoursView();
      break;
    case 'attendance':
      container.innerHTML = renderAttendanceView();
      break;
    case 'teachers':
      container.innerHTML = renderTeachersView();
      break;
    case 'grades':
      container.innerHTML = renderGradesView();
      setTimeout(renderAcademicChart, 50);
      break;
    case 'characterization':
      container.innerHTML = renderCharacterizationView();
      break;
    case 'standards':
      container.innerHTML = renderStandardsView();
      break;
    default:
      container.innerHTML = renderDashboardView();
  }
}

// Global Event Listeners (Print, Settings modal, etc.)
function setupEventListeners() {
  const printBtn = document.getElementById('printPageBtn');
  if (printBtn) {
    printBtn.addEventListener('click', () => window.print());
  }

  const exportBtn = document.getElementById('exportDataBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportDataJSON);
  }

  const importBtn = document.getElementById('importDataBtn');
  if (importBtn) {
    importBtn.addEventListener('click', triggerImportJSON);
  }

  const resetBtn = document.getElementById('resetDataBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetToDefaults);
  }
}

// -------------------------------------------------------------
// 1. Dashboard View (бѓ›бѓ—бѓђбѓ•бѓђбѓ бѓ бѓ’бѓ•бѓ”бѓ бѓ“бѓ)
// -------------------------------------------------------------
function renderDashboardView() {
  // Compute Key Stats
  const studentCount = appState.students.length;
  
  // Calculate Average GPA
  let totalGPA = 0;
  let gpaCount = 0;
  Object.values(appState.grades).forEach(g => {
    if (g.annualAvg) {
      totalGPA += g.annualAvg;
      gpaCount++;
    }
  });
  const avgGPA = gpaCount > 0 ? (totalGPA / gpaCount).toFixed(1) : '8.6';

  // Calculate Attendance Rate
  const activeMonthRecords = appState.attendance.records[selectedAttendanceMonth] || {};
  let presentDays = 0;
  let totalDays = 0;
  Object.values(activeMonthRecords).forEach(days => {
    days.forEach(st => {
      totalDays++;
      if (st === 'P' || st === 'E') presentDays++;
    });
  });
  const attRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 95;

  // Conducted homeroom hours
  let conductedHours = 0;
  Object.values(appState.homeroomHours).forEach(monthList => {
    monthList.forEach(item => {
      if (item.status === 'бѓ©бѓђбѓўбѓђбѓ бѓ“бѓђ') conductedHours++;
    });
  });

  return `
    <div class="space-y-6 animate-fade-in">
      <!-- Welcome Hero Banner -->
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div class="relative z-10 max-w-3xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold backdrop-blur-sm mb-3">
            <span>бѓЎбѓђбѓҐбѓђбѓ бѓ—бѓ•бѓ”бѓљбѓќбѓЎ бѓ’бѓђбѓњбѓђбѓ—бѓљбѓ”бѓ‘бѓбѓЎбѓђ бѓ“бѓђ бѓ›бѓ”бѓЄбѓњбѓбѓ”бѓ бѓ”бѓ‘бѓбѓЎ бѓЎбѓбѓЎбѓўбѓ”бѓ›бѓђ</span>
            <span>вЂў</span>
            <span>2026вЂ“2027 бѓЎбѓђбѓЎбѓ¬бѓђбѓ•бѓљбѓќ бѓ¬бѓ”бѓљбѓ</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            бѓ“бѓђбѓ›бѓ бѓбѓ’бѓ”бѓ‘бѓљбѓбѓЎ бѓ”бѓљбѓ”бѓҐбѓўбѓ бѓќбѓњбѓЈбѓљбѓ бѓџбѓЈбѓ бѓњбѓђбѓљбѓ
          </h2>
          <p class="text-indigo-200 text-sm sm:text-base leading-relaxed">
            ${appState.schoolInfo.name} вЂ” <span class="text-white font-semibold">${appState.schoolInfo.className}</span>. 
            бѓ“бѓђбѓ›бѓ бѓбѓ’бѓ”бѓ‘бѓ”бѓљбѓ: <span class="text-white font-semibold">${appState.schoolInfo.advisor}</span>. 
            бѓЎбѓ бѓЈбѓљбѓ бѓ›бѓђбѓ бѓ—бѓ•бѓбѓЎ, бѓ›бѓќбѓњбѓбѓўбѓќбѓ бѓбѓњбѓ’бѓбѓЎ, бѓђбѓ¦бѓ бѓбѓЄбѓ®бѓ•бѓбѓЎбѓђ бѓ“бѓђ бѓђбѓњбѓђбѓљбѓбѓўбѓбѓ™бѓбѓЎ бѓ”бѓ бѓ—бѓбѓђбѓњбѓ бѓЎбѓбѓ•бѓ бѓЄбѓ”.
          </p>
          <div class="mt-5 flex flex-wrap gap-3">
            <button onclick="navigateTo('students')" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-950 font-bold text-xs sm:text-sm hover:bg-indigo-50 transition shadow">
              <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
              бѓ›бѓќбѓЎбѓ¬бѓђбѓ•бѓљбѓ”бѓ—бѓђ бѓЎбѓбѓђ (${studentCount})
            </button>
            <button onclick="navigateTo('attendance')" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-700/80 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition backdrop-blur-sm border border-indigo-500/40">
              <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              бѓ“бѓђбѓЎбѓ¬бѓ бѓ”бѓ‘бѓбѓЎ бѓђбѓ¦бѓ бѓбѓЄбѓ®бѓ•бѓђ
            </button>
            <button onclick="navigateTo('grades')" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-700/80 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition backdrop-blur-sm border border-indigo-500/40">
              <svg class="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              бѓђбѓ™бѓђбѓ“бѓ”бѓ›бѓбѓЈбѓ бѓ бѓђбѓњбѓђбѓљбѓбѓўбѓбѓ™бѓђ
            </button>
          </div>
        </div>
        <div class="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      <!-- Quick Metrics Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div class="flex items-center justify-between text-slate-500 mb-2">
            <span class="text-xs font-semibold uppercase tracking-wider">бѓ›бѓќбѓЎбѓ¬бѓђбѓ•бѓљбѓ”бѓ”бѓ‘бѓ</span>
            <span class="p-2 rounded-xl bg-blue-50 text-blue-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            </span>
          </div>
          <div class="text-2xl sm:text-3xl font-extrabold text-slate-900">${studentCount}</div>
          <div class="text-xs text-slate-500 mt-1 flex items-center gap-1 text-emerald-600 font-medium">
            <span>в—Џ бѓђбѓҐбѓўбѓбѓЈбѓ бѓ бѓЎбѓбѓђ</span>
          </div>
        </div>

        <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div class="flex items-center justify-between text-slate-500 mb-2">
            <span class="text-xs font-semibold uppercase tracking-wider">бѓЎбѓђбѓЁбѓЈбѓђбѓљбѓќ бѓҐбѓЈбѓљбѓђ</span>
            <span class="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
            </span>
          </div>
          <div class="text-2xl sm:text-3xl font-extrabold text-slate-900">${avgGPA} <span class="text-sm font-normal text-slate-500">/ 10</span></div>
          <div class="text-xs text-slate-500 mt-1 text-emerald-600 font-medium">бѓ™бѓљбѓђбѓЎбѓбѓЎ бѓ¬бѓђбѓ бѓ›бѓђбѓўбѓ”бѓ‘бѓбѓЎ бѓ“бѓќбѓњбѓ”</div>
        </div>

        <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div class="flex items-center justify-between text-slate-500 mb-2">
            <span class="text-xs font-semibold uppercase tracking-wider">бѓ“бѓђбѓЎбѓ¬бѓ бѓ”бѓ‘бѓбѓЎ бѓ›бѓђбѓ©бѓ•бѓ”бѓњбѓ”бѓ‘бѓ”бѓљбѓ</span>
            <span class="p-2 rounded-xl bg-purple-50 text-purple-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </span>
          </div>
          <div class="text-2xl sm:text-3xl font-extrabold text-slate-900">${attRate}%</div>
          <div class="text-xs text-slate-500 mt-1">${selectedAttendanceMonth}бѓЎ бѓ—бѓ•бѓбѓЎ бѓ›бѓбѓ®бѓ”бѓ“бѓ•бѓбѓ—</div>
        </div>

        <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div class="flex items-center justify-between text-slate-500 mb-2">
            <span class="text-xs font-semibold uppercase tracking-wider">бѓ“бѓђбѓ›бѓ бѓбѓ’бѓ”бѓ‘бѓљбѓбѓЎ бѓЎбѓђбѓђбѓ—бѓ</span>
            <span class="p-2 rounded-xl bg-amber-50 text-amber-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            </span>
          </div>
          <div class="text-2xl sm:text-3xl font-extrabold text-slate-900">${conductedHours} <span class="text-sm font-normal text-slate-500">бѓ©бѓђбѓўбѓђбѓ бѓ”бѓ‘бѓЈбѓљбѓ</span></div>
          <div class="text-xs text-slate-500 mt-1">бѓЎбѓЈбѓљ 50 бѓ—бѓ”бѓ›бѓђбѓўбѓбѓ™бѓђ 10 бѓ—бѓ•бѓ”бѓЁбѓ</div>
        </div>
      </div>

      <!-- Journal Navigation Cards Grid (9 Core Sections) -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>бѓџбѓЈбѓ бѓњбѓђбѓљбѓбѓЎ бѓ’бѓђбѓњбѓ§бѓќбѓ¤бѓбѓљбѓ”бѓ‘бѓ”бѓ‘бѓ</span>
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">9 бѓ’бѓ•бѓ”бѓ бѓ“бѓ</span>
          </h3>
          <span class="text-xs text-slate-500 hidden sm:inline">бѓ“бѓђбѓђбѓ­бѓбѓ бѓ”бѓ— бѓ‘бѓђбѓ бѓђбѓ—бѓЎ бѓЎбѓђбѓЎбѓЈбѓ бѓ•бѓ”бѓљ бѓ’бѓђбѓњбѓ§бѓќбѓ¤бѓбѓљбѓ”бѓ‘бѓђбѓЁбѓ бѓ’бѓђбѓ“бѓђбѓЎбѓђбѓЎбѓ•бѓљбѓ”бѓљбѓђбѓ“</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Card 1 -->
          <div onclick="navigateTo('students')" class="group cursor-pointer bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                </span>
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-mono">1. бѓ›бѓќбѓЎбѓ¬бѓђбѓ•бѓљбѓ”бѓ”бѓ‘бѓ</span>
              </div>
              <h4 class="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition mb-1">бѓ›бѓќбѓЎбѓ¬бѓђбѓ•бѓљбѓ”бѓ—бѓђ бѓ›бѓќбѓњбѓђбѓЄбѓ”бѓ›бѓ”бѓ‘бѓ</h4>
              <p class="text-xs text-slate-500 leading-relaxed">
                26 бѓ›бѓќбѓЎбѓ¬бѓђбѓ•бѓљбѓбѓЎ бѓЎбѓ бѓЈбѓљбѓ бѓћбѓ бѓќбѓ¤бѓбѓљбѓ: бѓ“бѓђбѓ‘бѓђбѓ“бѓ”бѓ‘бѓбѓЎ бѓ—бѓђбѓ бѓбѓ¦бѓ, бѓ›бѓбѓЎбѓђбѓ›бѓђбѓ бѓ—бѓ, бѓ›бѓЁбѓќбѓ‘бѓљбѓбѓЎ бѓЎбѓўбѓђбѓўбѓЈбѓЎбѓ, бѓЎбѓђбѓ™бѓќбѓњбѓўбѓђбѓҐбѓўбѓќ бѓњбѓќбѓ›бѓ бѓ”бѓ‘бѓ бѓ“бѓђ бѓ бѓ”бѓ“бѓђбѓҐбѓўбѓбѓ бѓ”бѓ‘бѓђ.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-semibold">
              <span>бѓ’бѓђбѓ“бѓђбѓЎбѓ•бѓљбѓђ бѓЎбѓбѓђбѓ–бѓ”</span>
              <svg class="w-4 h-4 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </div>
          </div>

          <!-- Card 2 -->
          <div onclick="navigateTo('calendar')" class="group cursor-pointer bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </span>
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-mono">2. бѓ™бѓђбѓљбѓ”бѓњбѓ“бѓђбѓ бѓ</span>
              </div>
              <h4 class="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition mb-1">2026вЂ“2027 бѓЎбѓђбѓЎбѓ™бѓќбѓљбѓќ бѓ™бѓђбѓљбѓ”бѓњбѓ“бѓђбѓ бѓ</h4>
              <p class="text-xs text-slate-500 leading-relaxed">
                бѓЎбѓђбѓЎбѓ¬бѓђбѓ•бѓљбѓќ бѓ¬бѓљбѓбѓЎ бѓ™бѓђбѓљбѓ”бѓњбѓ“бѓђбѓ бѓ, бѓЎбѓ”бѓ›бѓ”бѓЎбѓўбѓ бѓ”бѓ‘бѓбѓЎ бѓ’бѓђбѓњбѓ бѓбѓ’бѓ, бѓќбѓ¤бѓбѓЄбѓбѓђбѓљбѓЈбѓ бѓ бѓ“бѓђбѓЎбѓ•бѓ”бѓњбѓ”бѓ‘бѓбѓЎ бѓ“бѓ¦бѓ”бѓ”бѓ‘бѓ, бѓђбѓ бѓ“бѓђбѓ“бѓ”бѓ’бѓ”бѓ‘бѓ бѓ“бѓђ бѓЎбѓђбѓЎбѓ™бѓќбѓљбѓќ бѓ¦бѓќбѓњбѓбѓЎбѓ«бѓбѓ”бѓ‘бѓ”бѓ‘бѓ.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-semibold">
              <span>бѓ™бѓђбѓљбѓ”бѓњбѓ“бѓ бѓбѓЎ бѓ’бѓђбѓ®бѓЎбѓњбѓђ</span>
              <svg class="w-4 h-4 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </div>
          </div>

          <!-- Card 3 -->
          <div onclick="navigateTo('action-plan')" class="group cursor-pointer bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-110 transition">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
                </span>
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 font-mono">3. бѓЎбѓђбѓ›бѓќбѓҐбѓ›бѓ”бѓ“бѓќ бѓ’бѓ”бѓ’бѓ›бѓђ</span>
              </div>
              <h4 class="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition mb-1">бѓ¬бѓљбѓбѓЎ бѓЎбѓђбѓ›бѓќбѓҐбѓ›бѓ”бѓ“бѓќ бѓ’бѓ”бѓ’бѓ›бѓђ</h4>
              <p class="text-xs text-slate-500 leading-relaxed">
                I бѓ“бѓђ II бѓЎбѓ”бѓ›бѓ”бѓЎбѓўбѓ бѓ”бѓ‘бѓбѓЎ бѓ“бѓ”бѓўбѓђбѓљбѓЈбѓ бѓ бѓЎбѓђбѓ›бѓќбѓҐбѓ›бѓ”бѓ“бѓќ бѓ’бѓ”бѓ’бѓ›бѓђ: бѓђбѓ›бѓќбѓЄбѓђбѓњбѓ”бѓ‘бѓ, бѓЁбѓ”бѓЎбѓ бѓЈбѓљбѓ”бѓ‘бѓбѓЎ бѓ•бѓђбѓ“бѓ”бѓ‘бѓ, бѓћбѓђбѓЎбѓЈбѓ®бѓбѓЎбѓ›бѓ’бѓ”бѓ‘бѓ”бѓљбѓ бѓћбѓбѓ бѓ”бѓ‘бѓ бѓ“бѓђ бѓўбѓ”бѓҐбѓЎбѓўбѓЈбѓ бѓ бѓђбѓ бѓ”.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-violet-600 font-semibold">
              <span>бѓ’бѓ”бѓ’бѓ›бѓбѓЎ бѓњбѓђбѓ®бѓ•бѓђ</span>
              <svg class="w-4 h-4 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </div>
          </div>

          <!-- Card 4 -->
          <div onclick="navigateTo('homeroom-hours')" class="group cursor-pointer bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </span>
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-mono">4. бѓ“бѓђбѓ›бѓ бѓбѓ’бѓ”бѓ‘бѓљбѓбѓЎ бѓЎбѓђбѓђбѓ—бѓ</span>
              </div>
              <h4 class="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition mb-1">бѓ“бѓђбѓ›бѓ бѓбѓ’бѓ”бѓ‘бѓљбѓбѓЎ бѓЎбѓђбѓђбѓ—бѓ</h4>
              <p class="text-xs text-slate-500 leading-relaxed">
                10 бѓ—бѓ•бѓбѓЎ бѓ’бѓђбѓњбѓ бѓбѓ’бѓ (бѓЎбѓ”бѓҐбѓўбѓ”бѓ›бѓ‘бѓ”бѓ бѓвЂ“бѓбѓ•бѓњбѓбѓЎбѓ), бѓ—бѓбѓ—бѓќбѓ”бѓЈбѓљ бѓ—бѓ•бѓ”бѓЁбѓ 5 бѓ®бѓ”бѓљбѓбѓ— бѓЁбѓ”бѓЎбѓђбѓ•бѓЎбѓ”бѓ‘бѓ бѓ—бѓ”бѓ›бѓђбѓўбѓбѓ™бѓђ, бѓ—бѓђбѓ бѓбѓ¦бѓ”бѓ‘бѓ бѓ“бѓђ бѓ›бѓбѓ–бѓњбѓ”бѓ‘бѓ.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-600 font-semibold">
              <span>бѓ—бѓ”бѓ›бѓђбѓўбѓбѓ™бѓбѓЎ бѓ бѓ”бѓ“бѓђбѓҐбѓўбѓбѓ бѓ”бѓ‘бѓђ</span>
              <svg class="w-4 h-4 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </div>
          </div>

          <!-- Card 5 -->
          <div onclick="navigateTo('attendance')" class="group cursor-pointer bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </span>
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-mono">5. бѓ“бѓђбѓЎбѓ¬бѓ бѓ”бѓ‘бѓђ</span>
              </div>
              <h4 class="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition mb-1">бѓ›бѓќбѓЎбѓ¬бѓђбѓ•бѓљбѓ”бѓ—бѓђ бѓ“бѓђбѓЎбѓ¬бѓ бѓ”бѓ‘бѓбѓЎ бѓђбѓ¦бѓ бѓбѓЄбѓ®бѓ•бѓђ</h4>
              <p class="text-xs text-slate-500 leading-relaxed">
                26 бѓ›бѓќбѓЎбѓ¬бѓђбѓ•бѓљбѓбѓЎ бѓ§бѓќбѓ•бѓ”бѓљбѓ“бѓ¦бѓбѓЈбѓ бѓ бѓђбѓ¦бѓ бѓбѓЄбѓ®бѓ•бѓђ (бѓ”бѓЎбѓ¬бѓ бѓ”бѓ‘бѓђ, бѓ’бѓђбѓЄбѓ“бѓ”бѓњбѓђ, бѓЎбѓђбѓћбѓђбѓўбѓбѓќ, бѓ“бѓђбѓ’бѓ•бѓбѓђбѓњбѓ”бѓ‘бѓђ) бѓ“бѓђ бѓђбѓ•бѓўбѓќбѓ›бѓђбѓўбѓЈбѓ бѓ бѓЇбѓђбѓ›бѓЈбѓ бѓ бѓЁбѓ”бѓ“бѓ”бѓ’бѓ”бѓ‘бѓбѓЎ бѓ’бѓ бѓђбѓ¤бѓђ.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-rose-600 font-semibold">
              <span>бѓђбѓ¦бѓ бѓбѓЄбѓ®бѓ•бѓбѓЎ бѓџбѓЈбѓ бѓњбѓђбѓљбѓ</span>
              <svg class="w-4 h-4 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </div>
          </div>

          <!-- Card 6 -->
          <div onclick="navigateTo('teachers')" class="group cursor-pointer bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                </span>
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-700 font-mono">6. бѓћбѓ”бѓ“бѓђбѓ’бѓќбѓ’бѓ”бѓ‘бѓ</span>
              </div>
              <h4 class="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition mb-1">бѓЎбѓђбѓ’бѓњбѓ”бѓ‘бѓ бѓ“бѓђ бѓ›бѓђбѓЎбѓ¬бѓђбѓ•бѓљбѓ”бѓ‘бѓљбѓ”бѓ‘бѓ</h4>
              <p class="text-xs text-slate-500 leading-relaxed">
                13 бѓЎбѓђбѓЎбѓ™бѓќбѓљбѓќ бѓЎбѓђбѓ’бѓњбѓбѓЎ бѓ©бѓђбѓ›бѓќбѓњбѓђбѓ—бѓ•бѓђбѓљбѓ, бѓЁбѓ”бѓ›бѓЎбѓ•бѓљбѓ”бѓљбѓ бѓћбѓ”бѓ“бѓђбѓ’бѓќбѓ’бѓ”бѓ‘бѓбѓЎ бѓЎбѓђбѓ™бѓќбѓњбѓўбѓђбѓҐбѓўбѓќ бѓўбѓ”бѓљбѓ”бѓ¤бѓќбѓњбѓ”бѓ‘бѓ, бѓ”бѓљбѓ¤бѓќбѓЎбѓўбѓђ бѓ“бѓђ бѓЎбѓђбѓ™бѓќбѓњбѓЎбѓЈбѓљбѓўбѓђбѓЄбѓбѓќ бѓЎбѓђбѓђбѓ—бѓ”бѓ‘бѓ.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-cyan-600 font-semibold">
              <span>бѓ™бѓђбѓўбѓђбѓљбѓќбѓ’бѓбѓЎ бѓњбѓђбѓ®бѓ•бѓђ</span>
              <svg class="w-4 h-4 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </div>
          </div>

          <!-- Card 7 -->
          <div onclick="navigateTo('grades')" class="group cursor-pointer bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                </span>
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-mono">7. бѓ›бѓќбѓЎбѓ¬бѓ бѓ”бѓ‘бѓђ & Recharts</span>
              </div>
              <h4 class="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition mb-1">бѓ›бѓќбѓЎбѓ¬бѓђбѓ•бѓљбѓбѓЎ бѓђбѓ™бѓђбѓ“бѓ”бѓ›бѓбѓЈбѓ бѓ бѓ›бѓќбѓЎбѓ¬бѓ бѓ”бѓ‘бѓђ</h4>
              <p class="text-xs text-slate-500 leading-relaxed">
                бѓњбѓбѓЁбѓњбѓ”бѓ‘бѓбѓЎ бѓЈбѓ¬бѓ§бѓбѓЎбѓ, бѓЎбѓ”бѓ›бѓ”бѓЎбѓўбѓ бѓЈбѓљбѓ бѓ“бѓђ бѓ¬бѓљбѓбѓЈбѓ бѓ бѓЎбѓђбѓЁбѓЈбѓђбѓљбѓќ бѓҐбѓЈбѓљбѓ”бѓ‘бѓ + бѓ™бѓљбѓђбѓЎбѓбѓЎ бѓЎбѓђбѓ”бѓ бѓ—бѓќ бѓ“бѓбѓњбѓђбѓ›бѓбѓ™бѓбѓЎ бѓбѓњбѓўбѓ”бѓ бѓђбѓҐбѓўбѓбѓЈбѓљбѓ Recharts бѓ•бѓбѓ–бѓЈбѓђбѓљбѓбѓ–бѓђбѓЄбѓбѓђ.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-semibold">
              <span>бѓ’бѓ бѓђбѓ¤бѓбѓ™бѓ”бѓ‘бѓ & бѓњбѓбѓЁбѓњбѓ”бѓ‘бѓ</span>
              <svg class="w-4 h-4 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </div>
          </div>

          <!-- Card 8 -->
          <div onclick="navigateTo('characterization')" class="group cursor-pointer bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                </span>
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 font-mono">8. бѓ“бѓђбѓ®бѓђбѓЎбѓбѓђбѓ—бѓ”бѓ‘бѓђ</span>
              </div>
              <h4 class="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition mb-1">бѓ›бѓќбѓЎбѓ¬бѓђбѓ•бѓљбѓбѓЎ бѓ–бѓќбѓ’бѓђбѓ“бѓ бѓ“бѓђбѓ®бѓђбѓЎбѓбѓђбѓ—бѓ”бѓ‘бѓђ</h4>
              <p class="text-xs text-slate-500 leading-relaxed">
                бѓбѓњбѓ“бѓбѓ•бѓбѓ“бѓЈбѓђбѓљбѓЈбѓ бѓ бѓ‘бѓљбѓќбѓ™бѓ”бѓ‘бѓ бѓ—бѓбѓ—бѓќбѓ”бѓЈбѓљ бѓ›бѓќбѓЎбѓ¬бѓђбѓ•бѓљбѓ”бѓ–бѓ”: бѓђбѓ™бѓђбѓ“бѓ”бѓ›бѓбѓЈбѓ бѓ, бѓҐбѓЄбѓ”бѓ•бѓбѓ—бѓ, бѓЎбѓќбѓЄбѓбѓђбѓљбѓЈбѓ бѓ бѓђбѓЎбѓћбѓ”бѓҐбѓўбѓ”бѓ‘бѓ, бѓ«бѓљбѓбѓ”бѓ бѓ бѓ›бѓ®бѓђбѓ бѓ”бѓ”бѓ‘бѓ бѓ“бѓђ бѓ бѓ”бѓ™бѓќбѓ›бѓ”бѓњбѓ“бѓђбѓЄбѓбѓ”бѓ‘бѓ.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-teal-600 font-semibold">
              <span>бѓ“бѓђбѓ®бѓђбѓЎбѓбѓђбѓ—бѓ”бѓ‘бѓбѓЎ бѓЁбѓ”бѓ“бѓ’бѓ”бѓњбѓђ</span>
              <svg class="w-4 h-4 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </div>
          </div>

          <!-- Card 9 -->
          <div onclick="navigateTo('standards')" class="group cursor-pointer bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-110 transition">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                </span>
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono">9. бѓ”бѓЎбѓ’ бѓЎбѓўбѓђбѓњбѓ“бѓђбѓ бѓўбѓ</span>
              </div>
              <h4 class="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition mb-1">бѓЎбѓђбѓ’бѓњбѓќбѓ‘бѓ бѓбѓ•бѓ бѓЎбѓўбѓђбѓњбѓ“бѓђбѓ бѓўбѓ</h4>
              <p class="text-xs text-slate-500 leading-relaxed">
                бѓ”бѓ бѓќбѓ•бѓњбѓЈбѓљбѓ бѓЎбѓђбѓЎбѓ¬бѓђбѓ•бѓљбѓќ бѓ’бѓ”бѓ’бѓ›бѓбѓЎ (бѓ”бѓЎбѓ’) бѓ›бѓќбѓ—бѓ®бѓќбѓ•бѓњбѓ”бѓ‘бѓ, бѓ’бѓђбѓ›бѓ­бѓќбѓљбѓ бѓ™бѓќбѓ›бѓћбѓ”бѓўбѓ”бѓњбѓЄбѓбѓ”бѓ‘бѓ, бѓЁбѓ”бѓ¤бѓђбѓЎбѓ”бѓ‘бѓбѓЎ бѓ™бѓ бѓбѓўбѓ”бѓ бѓбѓЈбѓ›бѓ”бѓ‘бѓ бѓ“бѓђ бѓ“бѓђбѓ›бѓ бѓбѓ’бѓ”бѓ‘бѓљбѓбѓЎ бѓ”бѓ—бѓбѓ™бѓбѓЎ бѓЎбѓўбѓђбѓњбѓ“бѓђбѓ бѓўбѓ”бѓ‘бѓ.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-700 font-semibold">
              <span>бѓЎбѓўбѓђбѓњбѓ“бѓђбѓ бѓўбѓбѓЎ бѓ’бѓђбѓЄбѓњбѓќбѓ‘бѓђ</span>
              <svg class="w-4 h-4 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick School Calendar Banner & Upcoming Events -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h4 class="text-base font-bold text-slate-900">бѓЈбѓђбѓ®бѓљбѓќбѓ”бѓЎбѓ бѓЎбѓђбѓЎбѓ™бѓќбѓљбѓќ бѓ¦бѓќбѓњбѓбѓЎбѓ«бѓбѓ”бѓ‘бѓ”бѓ‘бѓ бѓ“бѓђ бѓЈбѓҐбѓ›бѓ” бѓ“бѓ¦бѓ”бѓ”бѓ‘бѓ</h4>
            <p class="text-xs text-slate-500">2026вЂ“2027 бѓЎбѓђбѓЎбѓ¬бѓђбѓ•бѓљбѓќ бѓ¬бѓљбѓбѓЎ бѓђбѓҐбѓўбѓЈбѓђбѓљбѓЈбѓ бѓ бѓ’бѓ бѓђбѓ¤бѓбѓ™бѓ</p>
          </div>
          <button onclick="navigateTo('calendar')" class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            <span>бѓЎбѓ бѓЈбѓљбѓ бѓ™бѓђбѓљбѓ”бѓњбѓ“бѓ бѓбѓЎ бѓњбѓђбѓ®бѓ•бѓђ</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          ${appState.calendar.events.slice(0, 3).map(ev => `
            <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 hover:bg-indigo-50/40 transition">
              <div class="flex items-center gap-2 text-xs font-semibold text-indigo-700 mb-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <span>${ev.date}</span>
              </div>
              <div class="text-sm font-bold text-slate-900 mb-0.5">${ev.title}</div>
              <div class="text-xs text-slate-500">${ev.location} вЂў ${ev.target}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// 2. Section 1: бѓ›бѓќбѓЎбѓ¬бѓђбѓ•бѓљбѓ”бѓ—бѓђ бѓ›бѓќбѓњбѓђбѓЄбѓ”бѓ›бѓ”бѓ‘бѓ (Students Table)
// -------------------------------------------------------------
function renderStudentsView(searchTerm = '') {
  let list = appState.students;
  if (searchTerm) {
    const s = searchTerm.toLowerCase();
    list = list.filter(item => 
      item.firstName.toLowerCase().includes(s) ||
      item.lastName.toLowerCase().includes(s) ||
      item.parentName.toLowerCase().includes(s) ||
      item.phone.includes(s) ||
      item.address.toLowerCase().includes(s)
    );
  }

  return `
    <div class="space-y-4 animate-fade-in">
      <!-- Toolbar -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3 flex-1 max-w-md">
          <div class="relative w-full">
            <svg class="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input 
              id="studentSearchInput" 
              type="text" 
              placeholder="бѓ«бѓ”бѓ‘бѓњбѓђ: бѓЎбѓђбѓ®бѓ”бѓљбѓ, бѓ’бѓ•бѓђбѓ бѓ, бѓ›бѓЁбѓќбѓ‘бѓ”бѓљбѓ, бѓўбѓ”бѓљбѓ”бѓ¤бѓќбѓњбѓ..." 
              value="${searchTerm}"
              oninput="handleStudentSearch(this.value)"
              class="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>
          <span class="text-xs font-semibold px-2.5 py-2 rounded-xl bg-slate-100 text-slate-700 whitespace-nowrap">
            бѓЎбѓЈбѓљ: ${list.length}
          </span>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="openStudentModal()" class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span>бѓђбѓ®бѓђбѓљбѓ бѓ›бѓќбѓЎбѓ¬бѓђбѓ•бѓљбѓ”</span>
          </button>
          <button onclick="window.print()" class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            <span>бѓ‘бѓ”бѓ­бѓ“бѓ•бѓђ</span>
          </button>
        </div>
      </div>

      <!-- Students Table -->
      <div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="custom-table">
            <thead>
              <tr>
                <th class="w-12 text-center">#</th>
                <th>бѓЎбѓђбѓ®бѓ”бѓљбѓ бѓ“бѓђ бѓ’бѓ•бѓђбѓ бѓ</th>
                <th>бѓ“бѓђбѓ‘бѓђбѓ“бѓ”бѓ‘бѓбѓЎ бѓ—бѓђбѓ бѓбѓ¦бѓ</th>
                <th>бѓ¤бѓђбѓҐбѓўбѓќбѓ‘бѓ бѓбѓ•бѓ бѓ›бѓбѓЎбѓђбѓ›бѓђбѓ бѓ—бѓ</th>
                <th>бѓ›бѓЁбѓќбѓ‘бѓ”бѓљбѓ (бѓЎбѓўбѓђбѓўбѓЈбѓЎбѓ)</th>
                <th>бѓ›бѓЁбѓќбѓ‘бѓљбѓбѓЎ бѓЎбѓђбѓ®бѓ”бѓљбѓ, бѓ’бѓ•бѓђбѓ бѓ</th>
                <th>бѓ›бѓќбѓ‘бѓбѓљбѓЈбѓ бѓбѓЎ бѓњбѓќбѓ›бѓ”бѓ бѓ</th>
                <th class="text-right no-print">бѓ›бѓќбѓҐбѓ›бѓ”бѓ“бѓ”бѓ‘бѓђ</th>
              </tr>
            </thead>
            <tbody>
              ${list.length === 0 ? `
                <tr>
                  <td colspan="8" class="text-center py-8 text-slate-400">бѓ›бѓќбѓЎбѓ¬бѓђбѓ•бѓљбѓ” бѓ•бѓ”бѓ  бѓ›бѓќбѓбѓ«бѓ”бѓ‘бѓњбѓђ</td>
                </tr>
              ` : list.map((st, idx) => `
                <tr class="hover:bg-slate-50/80 transition">
                  <td class="text-center font-mono font-bold text-slate-500">${st.id || idx + 1}</td>
                  <td class="font-bold text-slate-900 whitespace-nowrap">
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-100">
                        ${st.firstName.charAt(0)}${st.lastName.charAt(0)}
                      </div>
                      <div>
                        <div>${st.firstName} ${st.lastName}</div>
                      </div>
                    </div>
                  </td>
                  <td class="whitespace-nowrap text-slate-600 font-mono text-xs">${st.birthDate}</td>
                  <td class="text-slate-600 max-w-xs truncate" title="${st.address}">${st.address}</td>
                  <td>
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      st.parentStatus.includes('бѓ“бѓ”бѓ“бѓђ') ? 'bg-pink-50 text-pink-700' :
                      st.parentStatus.includes('бѓ›бѓђбѓ›бѓђ') ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                    }">
                      ${st.parentStatus}
                    </span>
                  </td>
                  <td class="text-slate-800 font-medium whitespace-nowrap">${st.parentName}</td>
                  <td class="whitespace-nowrap font-mono text-xs text-indigo-600">
                    <a href="tel:${st.phone}" class="hover:underline flex items-center gap-1">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                      ${st.phone}
                    </a>
                  </td>
                  <td class="text-right whitespace-nowrap no-print">
                    <div class="flex items-center justify-end gap-1">
                      <button onclick="goToStudentChar(${st.id})" title="бѓ“бѓђбѓ®бѓђбѓЎбѓбѓђбѓ—бѓ”бѓ‘бѓђ" class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                      </button>
                      <button onclick="openStudentModal(${st.id})" title="бѓ бѓ”бѓ“бѓђбѓҐбѓўбѓбѓ бѓ”бѓ‘бѓђ" class="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button onclick="deleteStudent(${st.id})" title="бѓ¬бѓђбѓЁбѓљбѓђ" class="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function handleStudentSearch(val) {
  const container = document.getElementById('mainContent');
  if (container && currentView === 'students') {
    container.innerHTML = renderStudentsView(val);
    const input = document.getElementById('studentSearchInput');
    if (input) {
      input.focus();
      input.setSelectionRange(val.length, val.length);
    }
  }
}

function goToStudentChar(id) {
  activeStudentIdForChar = id;
  navigateTo('characterization');
}

// Student Modal (Add/Edit)
function openStudentModal(id = null) {
  const isEdit = id !== null;
  const student = isEdit ? appState.students.find(s => s.id === id) : {
    id: appState.students.length > 0 ? Math.max(...appState.students.map(s => s.id)) + 1 : 1,
    firstName: '',
    lastName: '',
    birthDate: '2012-01-01',
    address: 'бѓҐ. бѓ—бѓ‘бѓбѓљбѓбѓЎбѓ, ',
    parentStatus: 'бѓ“бѓ”бѓ“бѓђ',
    parentName: '',
    phone: '+995 '
  };

  let modal = document.getElementById('genericModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'genericModal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <h3 class="text-lg font-bold text-slate-900">${isEdit ? 'бѓ›бѓќбѓЎбѓ¬бѓђбѓ•бѓљбѓбѓЎ бѓ бѓ”бѓ“бѓђбѓҐбѓўбѓбѓ бѓ”бѓ‘бѓђ' : 'бѓђбѓ®бѓђбѓљбѓ бѓ›бѓќбѓЎбѓ¬бѓђбѓ•бѓљбѓбѓЎ бѓ“бѓђбѓ›бѓђбѓўбѓ”бѓ‘бѓђ'}</h3>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600 p-1">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <form id="studentForm" onsubmit="handleSaveStudent(event, ${isEdit ? id : 'null'})" class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">бѓЎбѓђбѓ®бѓ”бѓљбѓ *</label>
            <input type="text" id="m_firstName" required value="${student.firstName}" class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">бѓ’бѓ•бѓђбѓ бѓ *</label>
            <input type="text" id="m_lastName" required value="${student.lastName}" class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">бѓ“бѓђбѓ‘бѓђбѓ“бѓ”бѓ‘бѓбѓЎ бѓ—бѓђбѓ бѓбѓ¦бѓ</label>
            <input type="date" id="m_birthDate" value="${student.birthDate}" class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">бѓ›бѓЁбѓќбѓ‘бѓ”бѓљбѓ (бѓЎбѓўбѓђбѓўбѓЈбѓЎбѓ)</label>
            <select id="m_parentStatus" class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600">
              <option value="бѓ“бѓ”бѓ“бѓђ" ${student.parentStatus === 'бѓ“бѓ”бѓ“бѓђ' ? 'selected' : ''}>бѓ“бѓ”бѓ“бѓђ</option>
              <option value="бѓ›бѓђбѓ›бѓђ" ${student.parentStatus === 'бѓ›бѓђбѓ›бѓђ' ? 'selected' : ''}>бѓ›бѓђбѓ›бѓђ</option>
              <option value="бѓ›бѓ”бѓЈбѓ бѓ•бѓ”" ${student.parentStatus.includes('бѓ›бѓ”бѓЈбѓ бѓ•бѓ”') ? 'selected' : ''}>бѓ›бѓ”бѓЈбѓ бѓ•бѓ”</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">бѓ¤бѓђбѓҐбѓўбѓќбѓ‘бѓ бѓбѓ•бѓ бѓ›бѓбѓЎбѓђбѓ›бѓђбѓ бѓ—бѓ</label>
          <input type="text" id="m_address" value="${student.address}" class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">бѓ›бѓЁбѓќбѓ‘бѓљбѓбѓЎ бѓЎбѓђбѓ®бѓ”бѓљбѓ бѓ“бѓђ бѓ’бѓ•бѓђбѓ бѓ</label>
            <input type="text" id="m_parentName" value="${student.parentName}" class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">бѓ›бѓќбѓ‘бѓбѓљбѓЈбѓ бѓбѓЎ бѓњбѓќбѓ›бѓ”бѓ бѓ</label>
            <input type="text" id="m_phone" value="${student.phone}" class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600" />
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <button type="button" onclick="closeModal()" class="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition">бѓ’бѓђбѓЈбѓҐбѓ›бѓ”бѓ‘бѓђ</button>
          <button type="submit" class="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition">бѓЁбѓ”бѓњбѓђбѓ®бѓ•бѓђ</button>
        </div>
      </form>
    </div>
  `;
}

function closeModal() {
  const modal = document.getElementById('genericModal');
  if (modal) modal.remove();
}

function handleSaveStudent(e, existingId) {
  e.preventDefault();
  const firstName = document.getElementById('m_firstName').value.trim();
  const lastName = document.getElementById('m_lastName').value.trim();
  const birthDate = document.getElementById('m_birthDate').value;
  const parentStatus = document.getElementById('m_parentStatus').value;
  const address = document.getElementById('m_address').value.trim();
  const parentName = document.getElementById('m_parentName').value.trim();
  const phone = document.getElementById('m_phone').value.trim();

  if (existingId !== null) {
    const idx = appState.students.findIndex(s => s.id === existingId);
    if (idx !== -1) {
      appState.students[idx] = {
        ...appState.students[idx],
        firstName, lastName, birthDate, parentStatus, address, parentName, phone
      };
    }
  } else {
    const newId = appState.students.length > 0 ? Math.max(...appState.students.map(s => s.id)) + 1 : 1;
    const newStudent = { id: newId, firstName, lastName, birthDate, parentStatus, address, parentName, phone };
    appState.students.push(newStudent);
    // Initialize attendance and grades for new student
    appState.attendance.months.forEach(m => {
      if (!appState.attendance.records[m]) appState.attendance.records[m] = {};
      appState.attendance.records[m][newId] = Array(appState.attendance.daysCount).fill('P');
    });
    appState.grades[newId] = { subjects: {}, sem1Avg: 8.0, sem2Avg: 8.0, annualAvg: 8.0 };
    appState.subjects.forEach(sub => {
      appState.grades[newId].subjects[sub.id] = { sem1: 8.0, sem2: 8.0, annual: 8.0 };
    });
    appState.characterizations[newId] = {
      academic: `${firstName} бѓђбѓ•бѓљбѓ”бѓњбѓЎ бѓ™бѓђбѓ бѓ’ бѓђбѓ™бѓђбѓ“бѓ”бѓ›бѓбѓЈбѓ  бѓ›бѓќбѓЎбѓ¬бѓ бѓ”бѓ‘бѓђбѓЎ.`,
      behavior: 'бѓ›бѓќбѓ¬бѓ”бѓЎбѓ бѓбѓ’бѓ”бѓ‘бѓЈбѓљбѓ бѓ“бѓђ бѓ“бѓбѓЎбѓЄбѓбѓћбѓљбѓбѓњбѓбѓ бѓ”бѓ‘бѓЈбѓљбѓ.',
      social: 'бѓ™бѓ”бѓ—бѓбѓљбѓ’бѓђбѓњбѓ¬бѓ§бѓќбѓ‘бѓбѓљбѓ бѓ—бѓђбѓњбѓђбѓўбѓќбѓљбѓ”бѓ‘бѓ—бѓђбѓњ.',
      interests: 'бѓ“бѓђбѓбѓњбѓўбѓ”бѓ бѓ”бѓЎбѓ”бѓ‘бѓЈбѓљбѓбѓђ бѓЎбѓђбѓЎбѓ™бѓќбѓљбѓќ бѓђбѓҐбѓўбѓбѓ•бѓќбѓ‘бѓ”бѓ‘бѓбѓ—.',
      strengths: 'бѓћбѓђбѓЎбѓЈбѓ®бѓбѓЎбѓ›бѓ’бѓ”бѓ‘бѓљбѓќбѓ‘бѓђ.',
      recommendations: 'бѓЎбѓђбѓЎбѓ¬бѓђбѓ•бѓљбѓќ бѓћбѓ бѓќбѓЄбѓ”бѓЎбѓЁбѓ бѓђбѓҐбѓўбѓбѓЈбѓ бѓ бѓ©бѓђбѓ бѓ—бѓЈбѓљбѓќбѓ‘бѓђ.'
    };
  }

  saveState();
  closeModal();
  renderCurrentView();
}

function deleteStudent(id) {
  const st = appState.students.find(s => s.id === id);
  if (!st) return;
  if (confirm(`бѓ“бѓђбѓ бѓ¬бѓ›бѓЈбѓњбѓ”бѓ‘бѓЈбѓљбѓ бѓ®бѓђбѓ бѓ—, бѓ бѓќбѓ› бѓ’бѓЎбѓЈбѓ бѓ— бѓ›бѓќбѓЎбѓ¬бѓђбѓ•бѓљбѓбѓЎ бѓ¬бѓђбѓЁбѓљбѓђ: ${st.firstName} ${st.lastName}?`)) {
    appState.students = appState.students.filter(s => s.id !== id);
    delete appState.grades[id];
    delete appState.characterizations[id];
    saveState();
    renderCurrentView();
    showToast('бѓ›бѓќбѓЎбѓ¬бѓђбѓ•бѓљбѓ” бѓ¬бѓђбѓбѓЁбѓђбѓљбѓђ');
  }
}

// -------------------------------------------------------------
// 3. Section 2: 2026-2027 бѓЎбѓђбѓЎбѓ™бѓќбѓљбѓќ бѓ™бѓђбѓљбѓ”бѓњбѓ“бѓђбѓ бѓ
// -------------------------------------------------------------
function renderCalendarView() {
  const cal = appState.calendar;
  return `
    <div class="space-y-6 animate-fade-in">
      <!-- Semester periods header -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${cal.semesters.map((sem, i) => `
          <div class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl ${i === 0 ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'} flex items-center justify-center font-bold text-lg">
              ${i === 0 ? 'I' : 'II'}
            </div>
            <div>
              <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">${sem.name}</div>
              <div class="text-sm sm:text-base font-bold text-slate-900">${sem.period}</div>
              <div class="text-xs text-slate-500 mt-0.5">бѓ®бѓђбѓњбѓ’бѓ бѓ«бѓљбѓбѓ•бѓќбѓ‘бѓђ: ${sem.weeks} бѓЎбѓђбѓЎбѓ¬бѓђбѓ•бѓљбѓќ бѓ™бѓ•бѓбѓ бѓђ</div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Holidays / Vacation Days Block (бѓ“бѓђбѓЎбѓ•бѓ”бѓњбѓ”бѓ‘бѓбѓЎ бѓ“бѓ¦бѓ”бѓ”бѓ‘бѓ) -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div class="flex items-center gap-2">
            <span class="p-2 rounded-xl bg-rose-50 text-rose-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </span>
            <div>
              <h3 class="text-base font-bold text-slate-900">2026вЂ“2027 бѓЎбѓђбѓЎбѓ¬бѓђбѓ•бѓљбѓќ бѓ¬бѓљбѓбѓЎ бѓ“бѓђбѓЎбѓ•бѓ”бѓњбѓ”бѓ‘бѓбѓЎ бѓ“бѓ¦бѓ”бѓ”бѓ‘бѓ бѓ“бѓђ бѓђбѓ бѓ“бѓђбѓ“бѓ”бѓ’бѓ”бѓ‘бѓ</h3>
              <p class="text-xs text-slate-500">бѓќбѓ¤бѓбѓЄбѓбѓђбѓљбѓЈбѓ бѓ бѓЈбѓҐбѓ›бѓ” бѓ“бѓ¦бѓ”бѓ”бѓ‘бѓ бѓ“бѓђ бѓЎбѓђбѓЎбѓ™бѓќбѓљбѓќ бѓђбѓ бѓ“бѓђбѓ“бѓ”бѓ’бѓ”бѓ‘бѓбѓЎ бѓ’бѓ бѓђбѓ¤бѓбѓ™бѓ</p>
            </div>
          </div>
          <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-mono">14 бѓ“бѓђбѓЎбѓ•бѓ”бѓњбѓ”бѓ‘бѓбѓЎ бѓћбѓ”бѓ бѓбѓќбѓ“бѓ</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          ${cal.holidays.map(h => `
            <div class="p-3.5 rounded-xl border ${h.type.includes('бѓђбѓ бѓ“бѓђбѓ“бѓ”бѓ’бѓ”бѓ‘бѓ') ? 'bg-amber-50/50 border-amber-200/70' : 'bg-slate-50 border-slate-200/60'} hover:shadow-sm transition">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-bold text-indigo-900">${h.date}</span>
                <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full ${h.type.includes('бѓђбѓ бѓ“бѓђбѓ“бѓ”бѓ’бѓ”бѓ‘бѓ') ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'}">
                  ${h.type}
                </span>
              </div>
              <div class="text-sm font-semibold text-slate-800">${h.name}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Important School Events Block (бѓ›бѓњбѓбѓЁбѓ•бѓњбѓ”бѓљбѓќбѓ•бѓђбѓњбѓ бѓЎбѓђбѓЎбѓ™бѓќбѓљбѓќ бѓ¦бѓќбѓњбѓбѓЎбѓ«бѓбѓ”бѓ‘бѓ”бѓ‘бѓ) -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div class="flex items-center gap-2">
            <span class="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>
            </span>
            <div>
              <h3 class="text-base font-bold text-slate-900">бѓ›бѓњбѓбѓЁбѓ•бѓњбѓ”бѓљбѓќбѓ•бѓђбѓњбѓ бѓЎбѓђбѓЎбѓ™бѓќбѓљбѓќ бѓ¦бѓќбѓњбѓбѓЎбѓ«бѓбѓ”бѓ‘бѓ”бѓ‘бѓ</h3>
              <p class="text-xs text-slate-500">бѓќбѓљбѓбѓ›бѓћбѓбѓђбѓ“бѓ”бѓ‘бѓ, бѓ”бѓҐбѓЎбѓ™бѓЈбѓ бѓЎбѓбѓ”бѓ‘бѓ, бѓЁбѓ”бѓ›бѓђбѓЇбѓђбѓ›бѓ”бѓ‘бѓ”бѓљбѓ бѓ¬бѓ”бѓ бѓ”бѓ‘бѓ, бѓ™бѓ бѓ”бѓ‘бѓ”бѓ‘бѓ бѓ“бѓђ бѓ–бѓ”бѓбѓ›бѓ”бѓ‘бѓ</p>
            </div>
          </div>
          <button onclick="openAddEventModal()" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span>бѓ¦бѓќбѓњбѓбѓЎбѓ«бѓбѓ”бѓ‘бѓбѓЎ бѓ“бѓђбѓ›бѓђбѓўбѓ”бѓ‘бѓђ</span>
          </button>
        </div>

        <div class="space-y-2.5">
          ${cal.events.map((ev, index) => `
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/60 hover:bg-white hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex items-start sm:items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center text-center shrink-0">
                  <span class="text-[10px] font-bold text-indigo-600 uppercase font-mono">${ev.date.slice(5, 7)} бѓ—бѓ•бѓ”</span>
                  <span class="text-xs font-black text-slate-900 font-mono">${ev.date.slice(8, 10)}</span>
                </div>
                <div>
                  <div class="text-sm font-bold text-slate-900">${ev.title}</div>
                  <div class="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span class="flex items-center gap-1"><svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>${ev.location}</span>
                    <span>вЂў</span>
                    <span class="text-slate-600">${ev.target}</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2 self-end sm:self-center">
                <span class="text-xs font-mono text-slate-500">${ev.date}</span>
                <button onclick="deleteEvent(${ev.id})" title="бѓ¬бѓђбѓЁбѓљбѓђ" class="p-1 text-slate-400 hover:text-red-600 rounded">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function openAddEventModal() {
  let modal = document.getElementById('genericModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'genericModal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <h3 class="text-base font-bold text-slate-900">бѓђбѓ®бѓђбѓљбѓ бѓЎбѓђбѓЎбѓ™бѓќбѓљбѓќ бѓ¦бѓќбѓњбѓбѓЎбѓ«бѓбѓ”бѓ‘бѓђ</h3>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600 p-1">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <form onsubmit="handleSaveEvent(event)" class="space-y-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">бѓ—бѓђбѓ бѓбѓ¦бѓ *</label>
          <input type="date" id="ev_date" required class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200" value="2026-11-25" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">бѓ¦бѓќбѓњбѓбѓЎбѓ«бѓбѓ”бѓ‘бѓбѓЎ бѓ“бѓђбѓЎбѓђбѓ®бѓ”бѓљбѓ”бѓ‘бѓђ *</label>
          <input type="text" id="ev_title" required placeholder="бѓ›бѓђбѓ’: бѓ›бѓЁбѓќбѓ‘бѓ”бѓљбѓ—бѓђ бѓ™бѓ бѓ”бѓ‘бѓђ" class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">бѓђбѓ“бѓ’бѓбѓљбѓ›бѓ“бѓ”бѓ‘бѓђбѓ бѓ”бѓќбѓ‘бѓђ</label>
          <input type="text" id="ev_location" placeholder="бѓќбѓ—бѓђбѓ®бѓ 304 / бѓЎбѓђбѓђбѓҐбѓўбѓќ бѓ“бѓђбѓ бѓ‘бѓђбѓ–бѓ" class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">бѓЎбѓђбѓ›бѓбѓ–бѓњбѓ” бѓђбѓЈбѓ“бѓбѓўбѓќбѓ бѓбѓђ</label>
          <input type="text" id="ev_target" placeholder="IX-бѓђ бѓ™бѓљбѓђбѓЎбѓ, бѓ›бѓЁбѓќбѓ‘бѓљбѓ”бѓ‘бѓ" class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200" />
        </div>
        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button type="button" onclick="closeModal()" class="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700">бѓ’бѓђбѓЈбѓҐбѓ›бѓ”бѓ‘бѓђ</button>
          <button type="submit" class="px-4 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white">бѓ“бѓђбѓ›бѓђбѓўбѓ”бѓ‘бѓђ</button>
        </div>
      </form>
    </div>
  `;
}

function handleSaveEvent(e) {
  e.preventDefault();
  const date = document.getElementById('ev_date').value;
  const title = document.getElementById('ev_title').value.trim();
  const location = document.getElementById('ev_location').value.trim() || 'бѓЎбѓ™бѓќбѓљбѓђ';
  const target = document.getElementById('ev_target').value.trim() || 'IX-бѓђ бѓ™бѓљбѓђбѓЎбѓ';
  const newId = appState.calendar.events.length > 0 ? Math.max(...appState.calendar.events.map(ev => ev.id)) + 1 : 1;

  appState.calendar.events.push({ id: newId, date, title, location, target });
  appState.calendar.events.sort((a, b) => a.date.localeCompare(b.date));
  saveState();
  closeModal();
  renderCurrentView();
  showToast('бѓ¦бѓќбѓњбѓбѓЎбѓ«бѓбѓ”бѓ‘бѓђ бѓ“бѓђбѓ”бѓ›бѓђбѓўбѓђ');
}

function deleteEvent(id) {
  if (confirm('бѓњбѓђбѓ›бѓ“бѓ•бѓбѓљбѓђбѓ“ бѓ’бѓЎбѓЈбѓ бѓ— бѓ¦бѓќбѓњбѓбѓЎбѓ«бѓбѓ”бѓ‘бѓбѓЎ бѓ¬бѓђбѓЁбѓљбѓђ?')) {
    appState.calendar.events = appState.calendar.events.filter(e => e.id !== id);
    saveState();
    renderCurrentView();
  }
}

// -------------------------------------------------------------
// 4. Section 3: бѓ¬бѓљбѓбѓЎ бѓЎбѓђбѓ›бѓќбѓҐбѓ›бѓ”бѓ“бѓќ бѓ’бѓ”бѓ’бѓ›бѓђ (I & II бѓЎбѓ”бѓ›бѓ”бѓЎбѓўбѓ бѓ)
// -------------------------------------------------------------
function renderActionPlanView() {
  const p = appState.actionPlan;
  return `
    <div class="space-y-6 animate-fade-in">
      <!-- Section 1: I бѓЎбѓ”бѓ›бѓ”бѓЎбѓўбѓ бѓбѓЎ бѓЎбѓђбѓ›бѓќбѓҐбѓ›бѓ”бѓ“бѓќ бѓ’бѓ”бѓ’бѓ›бѓђ -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
          <div class="flex items-center gap-2.5">
            <span class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-sm flex items-center justify-center">I</span>
            <div>
              <h3 class="text-lg font-bold text-slate-900">${p.semester1.title}</h3>
              <p class="text-xs text-slate-500">бѓЎбѓ”бѓҐбѓўбѓ”бѓ›бѓ‘бѓ”бѓ бѓ 2026 вЂ“ бѓ“бѓ”бѓ™бѓ”бѓ›бѓ‘бѓ”бѓ бѓ 2026</p>
            </div>
          </div>
          <button onclick="openAddPlanItemModal('semester1')" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span>бѓђбѓҐбѓўбѓбѓ•бѓќбѓ‘бѓбѓЎ бѓ“бѓђбѓ›бѓђбѓўбѓ”бѓ‘бѓђ</span>
          </button>
        </div>

        <!-- Notes / Editable text area for Semester 1 -->
        <div class="mb-5">
          <label class="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>I бѓЎбѓ”бѓ›бѓ”бѓЎбѓўбѓ бѓбѓЎ бѓЎбѓўбѓ бѓђбѓўбѓ”бѓ’бѓбѓЈбѓљбѓ бѓ›бѓбѓ–бѓњбѓ”бѓ‘бѓ бѓ“бѓђ бѓћбѓ”бѓ“бѓђбѓ’бѓќбѓ’бѓбѓЈбѓ бѓ бѓЁбѓ”бѓњбѓбѓЁбѓ•бѓњбѓ”бѓ‘бѓ (бѓ®бѓ”бѓљбѓбѓ— бѓЁбѓ”бѓЎбѓђбѓ•бѓЎбѓ”бѓ‘бѓ бѓ•бѓ”бѓљбѓ):</span>
            <span class="text-[11px] text-indigo-600 font-normal">бѓђбѓ•бѓўбѓќбѓ›бѓђбѓўбѓЈбѓ бѓђбѓ“ бѓбѓњбѓђбѓ®бѓ”бѓ‘бѓђ</span>
          </label>
          <textarea 
            rows="3" 
            onchange="updatePlanNotes('semester1', this.value)"
            class="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50 leading-relaxed"
            placeholder="бѓЁбѓ”бѓбѓ§бѓ•бѓђбѓњбѓ”бѓ— I бѓЎбѓ”бѓ›бѓ”бѓЎбѓўбѓ бѓбѓЎ бѓЎбѓђбѓ›бѓќбѓҐбѓ›бѓ”бѓ“бѓќ бѓ’бѓ”бѓ’бѓ›бѓбѓЎ бѓ–бѓќбѓ’бѓђбѓ“бѓ бѓ›бѓбѓ–бѓњбѓ”бѓ‘бѓ..."
          >${p.semester1.notes}</textarea>
        </div>

        <!-- Items Table -->
        <div class="overflow-x-auto rounded-xl border border-slate-200/80">
          <table class="custom-table">
            <thead>
              <tr>
                <th class="w-12 text-center">#</th>
                <th>бѓђбѓҐбѓўбѓбѓ•бѓќбѓ‘бѓбѓЎ бѓ“бѓђбѓЎбѓђбѓ®бѓ”бѓљбѓ”бѓ‘бѓђ</th>
                <th>бѓ›бѓбѓ–бѓђбѓњбѓ / бѓ›бѓќбѓЎбѓђбѓљбѓќбѓ“бѓњбѓ”бѓљбѓ бѓЁбѓ”бѓ“бѓ”бѓ’бѓ</th>
                <th>бѓ•бѓђбѓ“бѓђ</th>
                <th>бѓћбѓђбѓЎбѓЈбѓ®бѓбѓЎбѓ›бѓ’бѓ”бѓ‘бѓ”бѓљбѓ</th>
                <th>бѓЎбѓўбѓђбѓўбѓЈбѓЎбѓ</th>
                <th class="text-right no-print">бѓ›бѓќбѓҐбѓ›бѓ”бѓ“бѓ”бѓ‘бѓђ</th>
              </tr>
            </thead>
            <tbody>
              ${p.semester1.items.map((item, idx) => `
                <tr>
                  <td class="text-center font-bold text-slate-400 font-mono">${idx + 1}</td>
                  <td class="font-bold text-slate-900">${item.task}</td>
                  <td class="text-slate-600 text-xs">${item.objective}</td>
                  <td class="whitespace-nowrap font-mono text-xs text-indigo-700 font-medium">${item.deadline}</td>
                  <td class="whitespace-nowrap text-xs text-slate-700">${item.responsible}</td>
                  <td class="whitespace-nowrap">
                    <button onclick="togglePlanStatus('semester1', ${item.id})" class="px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                      item.status === 'бѓЁбѓ”бѓЎбѓ бѓЈбѓљбѓ“бѓђ' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      item.status === 'бѓ›бѓбѓ›бѓ“бѓбѓњбѓђбѓ бѓ”бѓќбѓ‘бѓЎ' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-600'
                    }">
                      ${item.status}
                    </button>
                  </td>
                  <td class="text-right no-print">
                    <button onclick="deletePlanItem('semester1', ${item.id})" class="p-1 text-slate-400 hover:text-red-600">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Section 2: II бѓЎбѓ”бѓ›бѓ”бѓЎбѓўбѓ бѓбѓЎ бѓЎбѓђбѓ›бѓќбѓҐбѓ›бѓ”бѓ“бѓќ бѓ’бѓ”бѓ’бѓ›бѓђ -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
          <div class="flex items-center gap-2.5">
            <span class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-sm flex items-center justify-center">II</span>
            <div>
              <h3 class="text-lg font-bold text-slate-900">${p.semester2.title}</h3>
              <p class="text-xs text-slate-500">бѓбѓђбѓњбѓ•бѓђбѓ бѓ 2027 вЂ“ бѓбѓ•бѓњбѓбѓЎбѓ 2027</p>
            </div>
          </div>
          <button onclick="openAddPlanItemModal('semester2')" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span>бѓђбѓҐбѓўбѓбѓ•бѓќбѓ‘бѓбѓЎ бѓ“бѓђбѓ›бѓђбѓўбѓ”бѓ‘бѓђ</span>
          </button>
        </div>

        <!-- Notes / Editable text area for Semester 2 -->
        <div class="mb-5">
          <label class="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>II бѓЎбѓ”бѓ›бѓ”бѓЎбѓўбѓ бѓбѓЎ бѓЎбѓўбѓ бѓђбѓўбѓ”бѓ’бѓбѓЈбѓљбѓ бѓ›бѓбѓ–бѓњбѓ”бѓ‘бѓ бѓ“бѓђ бѓћбѓ”бѓ“бѓђбѓ’бѓќбѓ’бѓбѓЈбѓ бѓ бѓЁбѓ”бѓњбѓбѓЁбѓ•бѓњбѓ”бѓ‘бѓ (бѓ®бѓ”бѓљбѓбѓ— бѓЁбѓ”бѓЎбѓђбѓ•бѓЎбѓ”бѓ‘бѓ бѓ•бѓ”бѓљбѓ):</span>
            <span class="text-[11px] text-emerald-600 font-normal">бѓђбѓ•бѓўбѓќбѓ›бѓђбѓўбѓЈбѓ бѓђбѓ“ бѓбѓњбѓђбѓ®бѓ”бѓ‘бѓђ</span>
          </label>
          <textarea 
            rows="3" 
            onchange="updatePlanNotes('semester2', this.value)"
            class="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50 leading-relaxed"
            placeholder="бѓЁбѓ”бѓбѓ§бѓ•бѓђбѓњбѓ”бѓ— II бѓЎбѓ”бѓ›бѓ”бѓЎбѓўбѓ бѓбѓЎ бѓЎбѓђбѓ›бѓќбѓҐбѓ›бѓ”бѓ“бѓќ бѓ’бѓ”бѓ’бѓ›бѓбѓЎ бѓ–бѓќбѓ’бѓђбѓ“бѓ бѓ›бѓбѓ–бѓњбѓ”бѓ‘бѓ..."
          >${p.semester2.notes}</textarea>
        </div>

        <!-- Items Table -->
        <div class="overflow-x-auto rounded-xl border border-slate-200/80">
          <table class="custom-table">
            <thead>
              <tr>
                <th class="w-12 text-center">#</th>
                <th>бѓђбѓҐбѓўбѓбѓ•бѓќбѓ‘бѓбѓЎ бѓ“бѓђбѓЎбѓђбѓ®бѓ”бѓљбѓ”бѓ‘бѓђ</th>
                <th>бѓ›бѓбѓ–бѓђбѓњбѓ / бѓ›бѓќбѓЎбѓђбѓљбѓќбѓ“бѓњбѓ”бѓљбѓ бѓЁбѓ”бѓ“бѓ”бѓ’бѓ</th>
                <th>бѓ•бѓђбѓ“бѓђ</th>
                <th>бѓћбѓђбѓЎбѓЈбѓ®бѓбѓЎбѓ›бѓ’бѓ”бѓ‘бѓ”бѓљбѓ</th>
                <th>бѓЎбѓўбѓђбѓўбѓЈбѓЎбѓ</th>
                <th class="text-right no-print">бѓ›бѓќбѓҐбѓ›бѓ”бѓ“бѓ”бѓ‘бѓђ</th>
              </tr>
            </thead>
            <tbody>
              ${p.semester2.items.map((item, idx) => `
                <tr>
                  <td class="text-center font-bold text-slate-400 font-mono">${idx + 1}</td>
                  <td class="font-bold text-slate-900">${item.task}</td>
                  <td class="text-slate-600 text-xs">${item.objective}</td>
                  <td class="whitespace-nowrap font-mono text-xs text-emerald-700 font-medium">${item.deadline}</td>
                  <td class="whitespace-nowrap text-xs text-slate-700">${item.responsible}</td>
                  <td class="whitespace-nowrap">
                    <button onclick="togglePlanStatus('semester2', ${item.id})" class="px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                      item.status === 'бѓЁбѓ”бѓЎбѓ бѓЈбѓљбѓ“бѓђ' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      item.status === 'бѓ›бѓбѓ›бѓ“бѓбѓњбѓђбѓ бѓ”бѓќбѓ‘бѓЎ' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-600'
                    }">
                      ${item.status}
                    </button>
                  </td>
                  <td class="text-right no-print">
                    <button onclick="deletePlanItem('semester2', ${item.id})" class="p-1 text-slate-400 hover:text-red-600">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function updatePlanNotes(semester, val) {
  appState.actionPlan[semester].notes = val;
  saveState();
}

function togglePlanStatus(semester, itemId) {
  const item = appState.actionPlan[semester].items.find(i => i.id === itemId);
  if (!item) return;
  if (item.status === 'бѓ“бѓђбѓ’бѓ”бѓ’бѓ›бѓбѓљбѓбѓђ') item.status = 'бѓ›бѓбѓ›бѓ“бѓбѓњбѓђбѓ бѓ”бѓќбѓ‘бѓЎ';
  else if (item.status === 'бѓ›бѓбѓ›бѓ“бѓбѓњбѓђбѓ бѓ”бѓќбѓ‘бѓЎ') item.status = 'бѓЁбѓ”бѓЎбѓ бѓЈбѓљбѓ“бѓђ';
  else item.status = 'бѓ“бѓђбѓ’бѓ”бѓ’бѓ›бѓбѓљбѓбѓђ';
  saveState();
  renderCurrentView();
}

function deletePlanItem(semester, itemId) {
  if (confirm('бѓ¬бѓђбѓ•бѓЁбѓђбѓљбѓќбѓ— бѓђбѓ¦бѓњбѓбѓЁбѓњбѓЈбѓљбѓ бѓђбѓҐбѓўбѓбѓ•бѓќбѓ‘бѓђ?')) {
    appState.actionPlan[semester].items = appState.actionPlan[semester].items.filter(i => i.id !== itemId);
    saveState();
    renderCurrentView();
  }
}

function openAddPlanItemModal(semester) {
  let modal = document.getElementById('genericModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'genericModal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <h3 class="text-base font-bold text-slate-900">бѓђбѓҐбѓўбѓбѓ•бѓќбѓ‘бѓбѓЎ бѓ“бѓђбѓ›бѓђбѓўбѓ”бѓ‘бѓђ (${semester === 'semester1' ? 'I бѓЎбѓ”бѓ›бѓ”бѓЎбѓўбѓ бѓ' : 'II бѓЎбѓ”бѓ›бѓ”бѓЎбѓўбѓ бѓ'})</h3>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600 p-1">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <form onsubmit="handleSavePlanItem(event, '${semester}')" class="space-y-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">бѓђбѓҐбѓўбѓбѓ•бѓќбѓ‘бѓбѓЎ бѓ“бѓђбѓЎбѓђбѓ®бѓ”бѓљбѓ”бѓ‘бѓђ *</label>
          <input type="text" id="pi_task" required class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">бѓ›бѓбѓ–бѓђбѓњбѓ / бѓЁбѓ”бѓ“бѓ”бѓ’бѓ</label>
          <input type="text" id="pi_objective" class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">бѓ•бѓђбѓ“бѓђ</label>
            <input type="text" id="pi_deadline" placeholder="бѓ›бѓђбѓ’: бѓќбѓҐбѓўбѓќбѓ›бѓ‘бѓ”бѓ бѓ" class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">бѓћбѓђбѓЎбѓЈбѓ®бѓбѓЎбѓ›бѓ’бѓ”бѓ‘бѓ”бѓљбѓ</label>
            <input type="text" id="pi_responsible" value="бѓ“бѓђбѓ›бѓ бѓбѓ’бѓ”бѓ‘бѓ”бѓљбѓ" class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200" />
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button type="button" onclick="closeModal()" class="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700">бѓ’бѓђбѓЈбѓҐбѓ›бѓ”бѓ‘бѓђ</button>
          <button type="submit" class="px-4 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white">бѓЁбѓ”бѓњбѓђбѓ®бѓ•бѓђ</button>
        </div>
      </form>
    </div>
  `;
}

function handleSavePlanItem(e, semester) {
  e.preventDefault();
  const task = document.getElementById('pi_task').value.trim();
  const objective = document.getElementById('pi_objective').value.trim();
  const deadline = document.getElementById('pi_deadline').value.trim();
  const responsible = document.getElementById('pi_responsible').value.trim() || 'бѓ“бѓђбѓ›бѓ бѓбѓ’бѓ”бѓ‘бѓ”бѓљбѓ';
  const newId = appState.actionPlan[semester].items.length > 0 ? Math.max(...appState.actionPlan[semester].items.map(i => i.id)) + 1 : 1;

  appState.actionPlan[semester].items.push({ id: newId, task, objective, deadline, responsible, status: 'бѓ“бѓђбѓ’бѓ”бѓ’бѓ›бѓбѓљбѓбѓђ' });
  saveState();
  closeModal();
  renderCurrentView();
}

// -------------------------------------------------------------
// 5. Section 4: бѓ“бѓђбѓ›бѓ бѓбѓ’бѓ”бѓ‘бѓљбѓбѓЎ бѓЎбѓђбѓђбѓ—бѓ (бѓ—бѓ•бѓ”бѓ”бѓ‘бѓбѓЎ бѓ›бѓбѓ®бѓ”бѓ“бѓ•бѓбѓ—, 5 бѓ’бѓ бѓђбѓ¤бѓђ)
// -------------------------------------------------------------
let selectedHomeroomMonth = 'бѓЎбѓ”бѓҐбѓўбѓ”бѓ›бѓ‘бѓ”бѓ бѓ';

function renderHomeroomHoursView() {
  const months = ["бѓЎбѓ”бѓҐбѓўбѓ”бѓ›бѓ‘бѓ”бѓ бѓ", "бѓќбѓҐбѓўбѓќбѓ›бѓ‘бѓ”бѓ бѓ", "бѓњбѓќбѓ”бѓ›бѓ‘бѓ”бѓ бѓ", "бѓ“бѓ”бѓ™бѓ”бѓ›бѓ‘бѓ”бѓ бѓ", "бѓбѓђбѓњбѓ•бѓђбѓ бѓ", "бѓ—бѓ”бѓ‘бѓ”бѓ бѓ•бѓђбѓљбѓ", "бѓ›бѓђбѓ бѓўбѓ", "бѓђбѓћбѓ бѓбѓљбѓ", "бѓ›бѓђбѓбѓЎбѓ", "бѓбѓ•бѓњбѓбѓЎбѓ"];
  const currentMonthEntries = appState.homeroomHours[selectedHomeroomMonth] || [];

  return `
    <div class="space-y-6 animate-fade-in">
      <!-- Months Selector Pill Bar -->
      <div class="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-sm overflow-x-auto">
        <div class="flex items-center gap-2">
          ${months.map(m => {
            const isSelected = m === selectedHomeroomMonth;
            const entries = appState.homeroomHours[m] || [];
            const conducted = entries.filter(e => e.status === 'бѓ©бѓђбѓўбѓђбѓ бѓ“бѓђ').length;
            return `
              <button onclick="changeHomeroomMonth('${m}')" class="px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
                isSelected 
                  ? 'bg-amber-600 text-white shadow-sm' 
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
              }">
                <span>${m}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-600'}">
                  ${conducted}/5
                </span>
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Homeroom Month Card (Up to 5 editable entries) -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-4 gap-3">
          <div class="flex items-center gap-3">
            <span class="p-2 rounded-xl bg-amber-50 text-amber-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </span>
            <div>
              <h3 class="text-lg font-bold text-slate-900">${selectedHomeroomMonth} вЂ” бѓ“бѓђбѓ›бѓ бѓбѓ’бѓ”бѓ‘бѓљбѓбѓЎ бѓЎбѓђбѓђбѓ—бѓбѓЎ бѓ—бѓ”бѓ›бѓђбѓўбѓбѓ™бѓђ</h3>
              <p class="text-xs text-slate-500">бѓ—бѓ•бѓ”бѓЁбѓ бѓ’бѓђбѓ—бѓ•бѓђбѓљбѓбѓЎбѓ¬бѓбѓњбѓ”бѓ‘бѓЈбѓљбѓбѓђ бѓ›бѓђбѓҐбѓЎбѓбѓ›бѓЈбѓ› 5 бѓ®бѓ”бѓљбѓбѓ— бѓЁбѓ”бѓЎбѓђбѓ•бѓЎбѓ”бѓ‘бѓ бѓ’бѓ бѓђбѓ¤бѓђ бѓ—бѓ”бѓ›бѓ”бѓ‘бѓбѓЎ, бѓ—бѓђбѓ бѓбѓ¦бѓ”бѓ‘бѓбѓЎбѓђ бѓ“бѓђ бѓ›бѓбѓ–бѓњбѓ”бѓ‘бѓбѓЎбѓђбѓ—бѓ•бѓбѓЎ</p>
            </div>
          </div>
          <span class="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200/80">
            5 бѓ’бѓ бѓђбѓ¤бѓђ (бѓЁбѓ”бѓ•бѓЎбѓ”бѓ‘бѓЈбѓљбѓбѓђ: ${currentMonthEntries.filter(e => e.topic).length})
          </span>
        </div>

        <div class="space-y-4">
          ${currentMonthEntries.map((entry, idx) => `
            <div class="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-amber-300 transition-all">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center font-mono">
                    ${idx + 1}
                  </span>
                  <span class="text-xs font-semibold text-slate-600">бѓЎбѓђбѓђбѓ—бѓ #${idx + 1}</span>
                </div>
                <div class="flex items-center gap-2">
                  <select 
                    onchange="updateHomeroomEntry('${selectedHomeroomMonth}', ${entry.id}, 'status', this.value)"
                    class="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 ${
                      entry.status === 'бѓ©бѓђбѓўбѓђбѓ бѓ“бѓђ' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                    }">
                    <option value="бѓ“бѓђбѓ’бѓ”бѓ’бѓ›бѓбѓљбѓбѓђ" ${entry.status === 'бѓ“бѓђбѓ’бѓ”бѓ’бѓ›бѓбѓљбѓбѓђ' ? 'selected' : ''}>бѓ“бѓђбѓ’бѓ”бѓ’бѓ›бѓбѓљбѓбѓђ</option>
                    <option value="бѓ©бѓђбѓўбѓђбѓ бѓ“бѓђ" ${entry.status === 'бѓ©бѓђбѓўбѓђбѓ бѓ“бѓђ' ? 'selected' : ''}>бѓ©бѓђбѓўбѓђбѓ бѓ“бѓђ</option>
                    <option value="бѓ’бѓђбѓ“бѓђбѓбѓ“бѓќ" ${entry.status === 'бѓ’бѓђбѓ“бѓђбѓбѓ“бѓќ' ? 'selected' : ''}>бѓ’бѓђбѓ“бѓђбѓбѓ“бѓќ</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div class="md:col-span-6">
                  <label class="block text-[11px] font-semibold text-slate-500 mb-1">бѓ—бѓ”бѓ›бѓђ (бѓ®бѓ”бѓљбѓбѓ— бѓЁбѓ”бѓЎбѓђбѓ•бѓЎбѓ”бѓ‘бѓ бѓ’бѓ бѓђбѓ¤бѓђ)</label>
                  <input 
                    type="text" 
                    value="${entry.topic || ''}" 
                    placeholder="бѓЁбѓ”бѓбѓ§бѓ•бѓђбѓњбѓ”бѓ— бѓЎбѓђбѓђбѓ—бѓбѓЎ бѓ—бѓ”бѓ›бѓђ..." 
                    onchange="updateHomeroomEntry('${selectedHomeroomMonth}', ${entry.id}, 'topic', this.value)"
                    class="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-medium"
                  />
                </div>
                <div class="md:col-span-2">
                  <label class="block text-[11px] font-semibold text-slate-500 mb-1">бѓ—бѓђбѓ бѓбѓ¦бѓ</label>
                  <input 
                    type="date" 
                    value="${entry.date || ''}" 
                    onchange="updateHomeroomEntry('${selectedHomeroomMonth}', ${entry.id}, 'date', this.value)"
                    class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-mono"
                  />
                </div>
                <div class="md:col-span-4">
                  <label class="block text-[11px] font-semibold text-slate-500 mb-1">бѓ›бѓбѓ–бѓђбѓњбѓ / бѓ›бѓ—бѓђбѓ•бѓђбѓ бѓ бѓЎбѓђбѓ™бѓбѓ—бѓ®бѓ”бѓ‘бѓ / бѓЁбѓ”бѓњбѓбѓЁбѓ•бѓњбѓђ</label>
                  <input 
                    type="text" 
                    value="${entry.notes || ''}" 
                    placeholder="бѓЎбѓђбѓ™бѓ•бѓђбѓњбѓ«бѓќ бѓЎбѓђбѓ™бѓбѓ—бѓ®бѓ”бѓ‘бѓ..." 
                    onchange="updateHomeroomEntry('${selectedHomeroomMonth}', ${entry.id}, 'notes', this.value)"
                    class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function changeHomeroomMonth(m) {
  selectedHomeroomMonth = m;
  renderCurrentView();
}

function updateHomeroomEntry(month, entryId, field, val) {
  const list = appState.homeroomHours[month];
  if (!list) return;
  const item = list.find(e => e.id === entryId);
  if (item) {
    item[field] = val;
    saveState(true);
  }
}

// -------------------------------------------------------------
// 6. Section 5: бѓ›бѓќбѓЎбѓ¬бѓђбѓ•бѓљбѓ”бѓ—бѓђ бѓ“бѓђбѓЎбѓ¬бѓ бѓ”бѓ‘бѓбѓЎ бѓђбѓ¦бѓ бѓбѓЄбѓ®бѓ•бѓђ
// -------------------------------------------------------------
function renderAttendanceView() {
  const months = appState.attendance.months;
  const daysCount = appState.attendance.daysCount;
  const records = appState.attendance.records[selectedAttendanceMonth] || {};

  // Compute monthly stats
  let totalPres = 0, totalAbs = 0, totalExc = 0, totalLate = 0;
  appState.students.forEach(st => {
    const list = records[st.id] || [];
    list.forEach(val => {
      if (val === 'P') totalPres++;
      else if (val === 'A') totalAbs++;
      else if (val === 'E') totalExc++;
      else if (val === 'L') totalLate++;
    });
  });
  const totalSlots = (totalPres + totalAbs + totalExc + totalLate) || 1;
  const overallRate = Math.round(((totalPres + totalExc) / totalSlots) * 100);

  return `
    <div class="space-y-4 animate-fade-in">
      <!-- Toolbar & Month Selector -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div class="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">бѓ—бѓ•бѓ”:</span>
          ${months.map(m => `
            <button onclick="changeAttendanceMonth('${m}')" class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              m === selectedAttendanceMonth ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }">
              ${m}
            </button>
          `).join('')}
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button onclick="markAllPresentForMonth()" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs border border-emerald-200 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            <span>бѓ§бѓ•бѓ”бѓљбѓђ бѓ”бѓЎбѓ¬бѓ бѓ”бѓ‘бѓђ</span>
          </button>
          <button onclick="window.print()" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            <span>бѓ‘бѓ”бѓ­бѓ“бѓ•бѓђ</span>
          </button>
        </div>
      </div>

      <!-- Legend & Month Stats -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-1.5">
            <span class="att-btn status-p cursor-default">вњ“</span>
            <span class="font-medium text-slate-700">бѓ”бѓЎбѓ¬бѓ бѓ”бѓ‘бѓђ (P)</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="att-btn status-a cursor-default">вњ—</span>
            <span class="font-medium text-slate-700">бѓђбѓ бѓђбѓЎбѓђбѓћбѓђбѓўбѓбѓќ бѓ’бѓђбѓЄбѓ“бѓ”бѓњбѓђ (A)</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="att-btn status-e cursor-default">в…</span>
            <span class="font-medium text-slate-700">бѓЎбѓђбѓћбѓђбѓўбѓбѓќ бѓ’бѓђбѓЄбѓ“бѓ”бѓњбѓђ (E)</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="att-btn status-l cursor-default">вЏ°</span>
            <span class="font-medium text-slate-700">бѓ“бѓђбѓ’бѓ•бѓбѓђбѓњбѓ”бѓ‘бѓђ (L)</span>
          </div>
          <span class="text-slate-400 hidden sm:inline">| бѓ“бѓђбѓђбѓ¬бѓ™бѓђбѓћбѓЈбѓњбѓ”бѓ— бѓЈбѓЇбѓ бѓђбѓ–бѓ” бѓЎбѓўбѓђбѓўбѓЈбѓЎбѓбѓЎ бѓЁбѓ”бѓЎбѓђбѓЄбѓ•бѓљбѓ”бѓљбѓђбѓ“</span>
        </div>

        <div class="flex items-center gap-4 font-mono font-semibold">
          <span class="text-emerald-700">бѓЎбѓђбѓЁбѓЈбѓђбѓљбѓќ бѓ“бѓђбѓЎбѓ¬бѓ бѓ”бѓ‘бѓђ: ${overallRate}%</span>
          <span class="text-rose-600">бѓЎбѓЈбѓљ бѓђбѓ бѓђбѓЎбѓђбѓћбѓђбѓўбѓбѓќ: ${totalAbs}</span>
        </div>
      </div>

      <!-- Attendance Matrix Table -->
      <div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="custom-table text-center text-xs">
            <thead>
              <tr>
                <th class="w-10 text-center">#</th>
                <th class="text-left min-w-[180px]">бѓ›бѓќбѓЎбѓ¬бѓђбѓ•бѓљбѓбѓЎ бѓЎбѓђбѓ®бѓ”бѓљбѓ бѓ“бѓђ бѓ’бѓ•бѓђбѓ бѓ</th>
                ${Array.from({ length: daysCount }, (_, i) => `<th class="w-8 p-1 text-center font-mono">${i + 1}</th>`).join('')}
                <th class="bg-slate-100 font-bold text-slate-700">бѓЎбѓЈбѓљ бѓ’бѓђбѓЄбѓ“бѓ”бѓњбѓђ</th>
                <th class="bg-blue-50/50 font-bold text-blue-700">бѓЎбѓђбѓћбѓђбѓўбѓбѓќ</th>
                <th class="bg-rose-50/50 font-bold text-rose-700">бѓђбѓ бѓђбѓЎбѓђбѓћбѓђбѓўбѓбѓќ</th>
                <th class="bg-amber-50/50 font-bold text-amber-700">бѓ“бѓђбѓ’бѓ•бѓбѓђбѓњбѓ”бѓ‘бѓђ</th>
                <th class="bg-indigo-50 font-bold text-indigo-700">бѓ“бѓђбѓЎбѓ¬бѓ бѓ”бѓ‘бѓбѓЎ %</th>
              </tr>
            </thead>
            <tbody>
              ${appState.students.map((st, idx) => {
                const row = records[st.id] || Array(daysCount).fill('P');
                const pCount = row.filter(v => v === 'P').length;
                const aCount = row.filter(v => v === 'A').length;
                const eCount = row.filter(v => v === 'E').length;
                const lCount = row.filter(v => v === 'L').length;
                const totalAbsRow = aCount + eCount;
                const percent = Math.round(((pCount + eCount) / daysCount) * 100);

                return `
                  <tr class="hover:bg-slate-50/60">
                    <td class="font-mono font-bold text-slate-400 text-center">${idx + 1}</td>
                    <td class="text-left font-bold text-slate-900 whitespace-nowrap">${st.firstName} ${st.lastName}</td>
                    ${row.map((val, dayIdx) => {
                      let cls = 'status-p';
                      let symbol = 'вњ“';
                      if (val === 'A') { cls = 'status-a'; symbol = 'вњ—'; }
                      else if (val === 'E') { cls = 'status-e'; symbol = 'в…'; }
                      else if (val === 'L') { cls = 'status-l'; symbol = 'вЏ°'; }

                      return `
                        <td class="p-1">
                          <button 
                            onclick="cycleAttendanceStatus('${selectedAttendanceMonth}', ${st.id}, ${dayIdx})"
                            class="att-btn ${cls}"
                            title="бѓ›бѓќбѓЎбѓ¬бѓђбѓ•бѓљбѓ”: ${st.firstName} ${st.lastName}, бѓ“бѓ¦бѓ” ${dayIdx + 1}: ${val}">
                            ${symbol}
                          </button>
                        </td>
                      `;
                    }).join('')}
                    <!-- Summary columns -->
                    <td class="font-mono font-bold bg-slate-50 text-slate-700">${totalAbsRow}</td>
                    <td class="font-mono font-bold bg-blue-50/30 text-blue-700">${eCount}</td>
                    <td class="font-mono font-bold bg-rose-50/30 text-rose-700">${aCount}</td>
                    <td class="font-mono font-bold bg-amber-50/30 text-amber-700">${lCount}</td>
                    <td class="font-mono font-bold bg-indigo-50/30">
                      <span class="px-2 py-0.5 rounded-full text-[11px] ${
                        percent >= 90 ? 'bg-emerald-100 text-emerald-800' :
                        percent >= 75 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }">
                        ${percent}%
                      </span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function changeAttendanceMonth(m) {
  selectedAttendanceMonth = m;
  renderCurrentView();
}

function cycleAttendanceStatus(month, studentId, dayIdx) {
  const row = appState.attendance.records[month][studentId];
  if (!row) return;
  const current = row[dayIdx];
  let next = 'P';
  if (current === 'P') next = 'A';
  else if (current === 'A') next = 'E';
  else if (current === 'E') next = 'L';
  else if (current === 'L') next = 'P';

  row[dayIdx] = next;
  saveState(true);
  renderCurrentView();
}

function markAllPresentForMonth() {
  const records = appState.attendance.records[selectedAttendanceMonth];
  if (!records) return;
  appState.students.forEach(st => {
    records[st.id] = Array(appState.attendance.daysCount).fill('P');
  });
  saveState();
  renderCurrentView();
  showToast('бѓ§бѓ•бѓ”бѓљбѓђ бѓ›бѓќбѓЎбѓ¬бѓђбѓ•бѓљбѓ” бѓ›бѓќбѓњбѓбѓЁбѓњбѓЈбѓљбѓбѓђ бѓ бѓќбѓ’бѓќбѓ бѓЄ бѓ“бѓђбѓ›бѓЎбѓ¬бѓ бѓ”');
}

// -------------------------------------------------------------
// 7. Section 6: бѓЎбѓђбѓ’бѓњбѓ”бѓ‘бѓ бѓ“бѓђ бѓЁбѓ”бѓ›бѓЎбѓ•бѓљбѓ”бѓљбѓ бѓ›бѓђбѓЎбѓ¬бѓђбѓ•бѓљбѓ”бѓ‘бѓљбѓ”бѓ‘бѓ
// -------------------------------------------------------------
function renderTeachersView() {
  const list = appState.subjects;

  return `
    <div class="space-y-4 animate-fade-in">
      <div class="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
        <div>
          <h3 class="text-base font-bold text-slate-900">бѓЎбѓђбѓ’бѓњбѓ”бѓ‘бѓ бѓ“бѓђ бѓЁбѓ”бѓ›бѓЎбѓ•бѓљбѓ”бѓљбѓ бѓ›бѓђбѓЎбѓ¬бѓђбѓ•бѓљбѓ”бѓ‘бѓљбѓ”бѓ‘бѓ</h3>
          <p class="text-xs text-slate-500">IX-бѓђ бѓ™бѓљбѓђбѓЎбѓЁбѓ бѓЁбѓ”бѓ›бѓЎбѓ•бѓљбѓ”бѓљбѓ бѓћбѓ”бѓ“бѓђбѓ’бѓќбѓ’бѓ”бѓ‘бѓбѓЎ бѓЎбѓђбѓ™бѓќбѓњбѓўбѓђбѓҐбѓўбѓќ бѓЄбѓњбѓќбѓ‘бѓђбѓ бѓ бѓ“бѓђ бѓ’бѓђбѓњбѓ бѓбѓ’бѓ</p>
        </div>
        <button onclick="openSubjectModal()" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm transition">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          <span>бѓЎбѓђбѓ’бѓњбѓбѓЎ бѓ“бѓђбѓ›бѓђбѓўбѓ”бѓ‘бѓђ</span>
        </button>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="custom-table">
            <thead>
              <tr>
                <th class="w-12 text-center">#</th>
                <th>бѓЎбѓђбѓ’бѓђбѓњбѓ</th>
                <th>бѓ›бѓђбѓЎбѓ¬бѓђбѓ•бѓљбѓ”бѓ‘бѓљбѓбѓЎ бѓЎбѓђбѓ®бѓ”бѓљбѓ бѓ“бѓђ бѓ’бѓ•бѓђбѓ бѓ</th>
                <th>бѓЎбѓђбѓ™бѓќбѓњбѓўбѓђбѓҐбѓўбѓќ бѓўбѓ”бѓљбѓ”бѓ¤бѓќбѓњбѓ</th>
                <th>бѓ”бѓљбѓ¤бѓќбѓЎбѓўбѓђ</th>
                <th>бѓЎбѓђбѓ™бѓќбѓњбѓЎбѓЈбѓљбѓўбѓђбѓЄбѓбѓќ бѓЎбѓђбѓђбѓ—бѓ”бѓ‘бѓ</th>
                <th>бѓ“бѓђбѓ›бѓ бѓбѓ’бѓ”бѓ‘бѓљбѓбѓЎ бѓЁбѓ”бѓњбѓбѓЁбѓ•бѓњбѓђ</th>
                <th class="text-right no-print">бѓ›бѓќбѓҐбѓ›бѓ”бѓ“бѓ”бѓ‘бѓђ</th>
              </tr>
            </thead>
            <tbody>
              ${list.map((sub, idx) => `
                <tr class="hover:bg-slate-50/80 transition">
                  <td class="text-center font-mono font-bold text-slate-400">${idx + 1}</td>
                  <td class="font-bold text-slate-900 whitespace-nowrap">
                    <span class="inline-block px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 text-xs font-semibold">
                      ${sub.name}
                    </span>
                  </td>
                  <td class="font-medium text-slate-800 whitespace-nowrap">${sub.teacher}</td>
                  <td class="font-mono text-xs whitespace-nowrap text-indigo-600">
                    <a href="tel:${sub.phone}" class="hover:underline flex items-center gap-1">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                      ${sub.phone}
                    </a>
                  </td>
                  <td class="font-mono text-xs whitespace-nowrap text-slate-600">
                    <a href="mailto:${sub.email}" class="hover:underline flex items-center gap-1">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                      ${sub.email}
                    </a>
                  </td>
                  <td class="text-xs text-slate-700 whitespace-nowrap">${sub.hours}</td>
                  <td class="text-xs text-slate-500 max-w-xs truncate" title="${sub.notes}">${sub.notes}</td>
                  <td class="text-right whitespace-nowrap no-print">
                    <button onclick="openSubjectModal(${sub.id})" class="p-1.5 text-slate-400 hover:text-indigo-600 rounded">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button onclick="deleteSubject(${sub.id})" class="p-1.5 text-slate-400 hover:text-red-600 rounded">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function openSubjectModal(id = null) {
  const isEdit = id !== null;
  const sub = isEdit ? appState.subjects.find(s => s.id === id) : {
    id: appState.subjects.length > 0 ? Math.max(...appState.subjects.map(s => s.id)) + 1 : 1,
    name: '',
    teacher: '',
    phone: '+995 ',
    email: '@school.ge',
    hours: '',
    notes: ''
  };

  let modal = document.getElementById('genericModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'genericModal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <h3 class="text-base font-bold text-slate-900">${isEdit ? 'бѓЎбѓђбѓ’бѓњбѓбѓЎ бѓ бѓ”бѓ“бѓђбѓҐбѓўбѓбѓ бѓ”бѓ‘бѓђ' : 'бѓђбѓ®бѓђбѓљбѓ бѓЎбѓђбѓ’бѓњбѓбѓЎ бѓ“бѓђбѓ›бѓђбѓўбѓ”бѓ‘бѓђ'}</h3>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600 p-1">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <form onsubmit="handleSaveSubject(event, ${isEdit ? id : 'null'})" class="space-y-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">бѓЎбѓђбѓ’бѓњбѓбѓЎ бѓ“бѓђбѓЎбѓђбѓ®бѓ”бѓљбѓ”бѓ‘бѓђ *</label>
          <input type="text" id="sub_name" required value="${sub.name}" class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">бѓ›бѓђбѓЎбѓ¬бѓђбѓ•бѓљбѓ”бѓ‘бѓљбѓбѓЎ бѓЎбѓђбѓ®бѓ”бѓљбѓ бѓ“бѓђ бѓ’бѓ•бѓђбѓ бѓ *</label>
          <input type="text" id="sub_teacher" required value="${sub.teacher}" class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">бѓўбѓ”бѓљбѓ”бѓ¤бѓќбѓњбѓ</label>
            <input type="text" id="sub_phone" value="${sub.phone}" class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">бѓ”бѓљбѓ¤бѓќбѓЎбѓўбѓђ</label>
            <input type="text" id="sub_email" value="${sub.email}" class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200" />
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">бѓЎбѓђбѓ™бѓќбѓњбѓЎбѓЈбѓљбѓўбѓђбѓЄбѓбѓќ бѓЎбѓђбѓђбѓ—бѓ”бѓ‘бѓ</label>
          <input type="text" id="sub_hours" value="${sub.hours}" placeholder="бѓ›бѓђбѓ’: бѓЎбѓђбѓ›бѓЁбѓђбѓ‘бѓђбѓ—бѓ 14:00 - 15:00" class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">бѓ“бѓђбѓ›бѓ бѓбѓ’бѓ”бѓ‘бѓљбѓбѓЎ бѓЁбѓ”бѓњбѓбѓЁбѓ•бѓњбѓђ</label>
          <input type="text" id="sub_notes" value="${sub.notes}" class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200" />
        </div>
        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button type="button" onclick="closeModal()" class="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700">бѓ’бѓђбѓЈбѓҐбѓ›бѓ”бѓ‘бѓђ</button>
          <button type="submit" class="px-4 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white">бѓЁбѓ”бѓњбѓђбѓ®бѓ•бѓђ</button>
        </div>
      </form>
    </div>
  `;
}

function handleSaveSubject(e, existingId) {
  e.preventDefault();
  const name = document.getElementById('sub_name').value.trim();
  const teacher = document.getElementById('sub_teacher').value.trim();
  const phone = document.getElementById('sub_phone').value.trim();
  const email = document.getElementById('sub_email').value.trim();
  const hours = document.getElementById('sub_hours').value.trim();
  const notes = document.getElementById('sub_notes').value.trim();

  if (existingId !== null) {
    const idx = appState.subjects.findIndex(s => s.id === existingId);
    if (idx !== -1) {
      appState.subjects[idx] = { ...appState.subjects[idx], name, teacher, phone, email, hours, notes };
    }
  } else {
    const newId = appState.subjects.length > 0 ? Math.max(...appState.subjects.map(s => s.id)) + 1 : 1;
    appState.subjects.push({ id: newId, name, teacher, phone, email, hours, notes });
  }

  saveState();
  closeModal();
  renderCurrentView();
}

function deleteSubject(id) {
  if (confirm('бѓ¬бѓђбѓ•бѓЁбѓђбѓљбѓќбѓ— бѓђбѓ¦бѓњбѓбѓЁбѓњбѓЈбѓљбѓ бѓЎбѓђбѓ’бѓђбѓњбѓ?')) {
    appState.subjects = appState.subjects.filter(s => s.id !== id);
    saveState();
    renderCurrentView();
  }
}

// -------------------------------------------------------------
// 8. Section 7: бѓ›бѓќбѓЎбѓ¬бѓђбѓ•бѓљбѓбѓЎ бѓђбѓ™бѓђбѓ“бѓ”бѓ›бѓбѓЈбѓ бѓ бѓ›бѓќбѓЎбѓ¬бѓ бѓ”бѓ‘бѓђ & Recharts
// -------------------------------------------------------------
function renderGradesView() {
  const students = appState.students;
  const subjects = appState.subjects;

  // Compute Class Subject Averages
  const subjectAverages = subjects.map(sub => {
    let sum = 0;
    let count = 0;
    students.forEach(st => {
      const g = appState.grades[st.id]?.subjects[sub.id];
      if (g && g.annual) {
        sum += g.annual;
        count++;
      }
    });
    return {
      id: sub.id,
      name: sub.name,
      shortName: sub.name.split(' ')[0],
      average: count > 0 ? Math.round((sum / count) * 10) / 10 : 8.0
    };
  });

  return `
    <div class="space-y-6 animate-fade-in">
      <!-- Recharts Interactive Visualization Block -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div class="flex items-center gap-2">
              <span class="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              </span>
              <h3 class="text-lg font-bold text-slate-900">бѓЎбѓђбѓЁбѓЈбѓђбѓљбѓќ бѓҐбѓЈбѓљбѓ”бѓ‘бѓбѓЎ бѓбѓњбѓўбѓ”бѓ бѓђбѓҐбѓўбѓбѓЈбѓљбѓ бѓ•бѓбѓ–бѓЈбѓђбѓљбѓбѓ–бѓђбѓЄбѓбѓђ (Recharts)</h3>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">бѓ™бѓљбѓђбѓЎбѓбѓЎ бѓЎбѓђбѓ”бѓ бѓ—бѓќ бѓђбѓ™бѓђбѓ“бѓ”бѓ›бѓбѓЈбѓ бѓ бѓ“бѓбѓњбѓђбѓ›бѓбѓ™бѓђ бѓ“бѓђ бѓЎбѓђбѓ’бѓњбѓќбѓ‘бѓ бѓбѓ•бѓ бѓЁбѓ”бѓ“бѓ”бѓ’бѓ”бѓ‘бѓ</p>
          </div>

          <!-- Chart View Switcher Tabs -->
          <div class="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 self-start sm:self-auto">
            <button onclick="switchChartType('subjects')" class="px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              chartType === 'subjects' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }">бѓЎбѓђбѓ’бѓњбѓќбѓ‘бѓ бѓбѓ•бѓ бѓЎбѓђбѓЁбѓЈбѓђбѓљбѓќ</button>
            <button onclick="switchChartType('distribution')" class="px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              chartType === 'distribution' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }">бѓҐбѓЈбѓљбѓђбѓ—бѓђ бѓ’бѓђбѓњбѓђбѓ¬бѓбѓљбѓ”бѓ‘бѓђ</button>
            <button onclick="switchChartType('ranking')" class="px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              chartType === 'ranking' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }">бѓўбѓќбѓћ бѓ бѓ”бѓбѓўбѓбѓњбѓ’бѓ</button>
          </div>
        </div>

        <!-- Chart Container Target -->
        <div id="rechartsTarget" class="mt-4 w-full min-h-[300px] flex items-center justify-center">
          <!-- Rendered via renderAcademicChart() -->
        </div>
      </div>

      <!-- Grades Matrix Table -->
      <div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 class="text-base font-bold text-slate-900">бѓ›бѓќбѓЎбѓ¬бѓђбѓ•бѓљбѓ”бѓ—бѓђ бѓњбѓбѓЁбѓњбѓ”бѓ‘бѓбѓЎбѓђ бѓ“бѓђ бѓЎбѓђбѓЁбѓЈбѓђбѓљбѓќ бѓҐбѓЈбѓљбѓ”бѓ‘бѓбѓЎ бѓЈбѓ¬бѓ§бѓбѓЎбѓ</h4>
            <p class="text-xs text-slate-500">бѓ“бѓђбѓђбѓ¬бѓ™бѓђбѓћбѓЈбѓњбѓ”бѓ— бѓњбѓ”бѓ‘бѓбѓЎбѓ›бѓбѓ”бѓ  бѓњбѓбѓЁбѓђбѓњбѓ–бѓ” бѓ бѓ”бѓ“бѓђбѓҐбѓўбѓбѓ бѓ”бѓ‘бѓбѓЎбѓ—бѓ•бѓбѓЎ (бѓђбѓ•бѓўбѓќбѓ›бѓђбѓўбѓЈбѓ бѓ бѓ’бѓђбѓ“бѓђбѓ—бѓ•бѓљбѓђ)</p>
          </div>
          <button onclick="window.print()" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            <span>бѓ‘бѓ”бѓ­бѓ“бѓ•бѓђ</span>
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="custom-table text-xs">
            <thead>
              <tr>
                <th class="w-10 text-center">#</th>
                <th class="text-left min-w-[170px]">бѓ›бѓќбѓЎбѓ¬бѓђбѓ•бѓљбѓбѓЎ бѓЎбѓђбѓ®бѓ”бѓљбѓ бѓ“бѓђ бѓ’бѓ•бѓђбѓ бѓ</th>
                ${subjects.map(sub => `<th class="text-center truncate max-w-[90px]" title="${sub.name}">${sub.name.split(' ')[0]}</th>`).join('')}
                <th class="bg-indigo-50/50 text-indigo-900 font-bold text-center">I бѓЎбѓ”бѓ›бѓ”бѓЎбѓўбѓ бѓ</th>
                <th class="bg-indigo-50/50 text-indigo-900 font-bold text-center">II бѓЎбѓ”бѓ›бѓ”бѓЎбѓўбѓ бѓ</th>
                <th class="bg-indigo-100 text-indigo-950 font-black text-center">бѓ¬бѓљбѓбѓЈбѓ бѓ GPA</th>
              </tr>
            </thead>
            <tbody>
              ${students.map((st, idx) => {
                const g = appState.grades[st.id] || { subjects: {}, sem1Avg: 8.5, sem2Avg: 8.5, annualAvg: 8.5 };
                return `
                  <tr class="hover:bg-slate-50/80 transition">
                    <td class="text-center font-bold font-mono text-slate-400">${idx + 1}</td>
                    <td class="font-bold text-slate-900 whitespace-nowrap">
                      <button onclick="goToStudentChar(${st.id})" class="hover:text-indigo-600 transition text-left">
                        ${st.firstName} ${st.lastName}
                      </button>
                    </td>
                    ${subjects.map(sub => {
                      const subG = g.subjects[sub.id] || { annual: 8.0 };
                      const val = subG.annual;
                      let badgeCls = 'grade-8';
                      if (val >= 9) badgeCls = 'grade-10';
                      else if (val >= 7) badgeCls = 'grade-8';
                      else if (val >= 5) badgeCls = 'grade-6';
                      else badgeCls = 'grade-low';

                      return `
                        <td class="text-center p-1">
                          <button 
                            onclick="editStudentGrade(${st.id}, ${sub.id}, ${val})"
                            class="grade-badge ${badgeCls} cursor-pointer hover:scale-110 transition shadow-xs"
                            title="${sub.name}: ${val}">
                            ${val}
                          </button>
                        </td>
                      `;
                    }).join('')}
                    <td class="text-center font-mono font-bold text-indigo-800 bg-indigo-50/20">${g.sem1Avg || 8.5}</td>
                    <td class="text-center font-mono font-bold text-indigo-800 bg-indigo-50/20">${g.sem2Avg || 8.5}</td>
                    <td class="text-center font-mono font-extrabold text-indigo-950 bg-indigo-100/50 text-sm">
                      ${g.annualAvg || 8.5}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function switchChartType(type) {
  chartType = type;
  renderCurrentView();
}

function editStudentGrade(studentId, subjectId, currentVal) {
  const st = appState.students.find(s => s.id === studentId);
  const sub = appState.subjects.find(s => s.id === subjectId);
  const input = prompt(`бѓЁбѓ”бѓбѓ§бѓ•бѓђбѓњбѓ”бѓ— бѓђбѓ®бѓђбѓљбѓ бѓњбѓбѓЁбѓђбѓњбѓ (1-10):\nбѓ›бѓќбѓЎбѓ¬бѓђбѓ•бѓљбѓ”: ${st.firstName} ${st.lastName}\nбѓЎбѓђбѓ’бѓђбѓњбѓ: ${sub.name}`, currentVal);
  if (input !== null) {
    const num = parseFloat(input);
    if (!isNaN(num) && num >= 1 && num <= 10) {
      if (!appState.grades[studentId]) appState.grades[studentId] = { subjects: {} };
      if (!appState.grades[studentId].subjects[subjectId]) appState.grades[studentId].subjects[subjectId] = {};
      
      appState.grades[studentId].subjects[subjectId].annual = Math.round(num * 10) / 10;
      appState.grades[studentId].subjects[subjectId].sem1 = Math.round(num * 10) / 10;
      appState.grades[studentId].subjects[subjectId].sem2 = Math.round(num * 10) / 10;

      // Recalculate student averages
      let total = 0;
      let count = 0;
      appState.subjects.forEach(s => {
        const val = appState.grades[studentId].subjects[s.id]?.annual;
        if (val) {
          total += val;
          count++;
        }
      });
      const avg = count > 0 ? Math.round((total / count) * 10) / 10 : num;
      appState.grades[studentId].annualAvg = avg;
      appState.grades[studentId].sem1Avg = avg;
      appState.grades[studentId].sem2Avg = avg;

      saveState();
      renderCurrentView();
      showToast('бѓњбѓбѓЁбѓђбѓњбѓ бѓ’бѓђбѓњбѓђбѓ®бѓљбѓ“бѓђ');
    } else {
      alert('бѓ’бѓ—бѓ®бѓќбѓ•бѓ— бѓЁбѓ”бѓбѓ§бѓ•бѓђбѓњбѓќбѓ— бѓ бѓбѓЄбѓ®бѓ•бѓ 1-бѓ“бѓђбѓњ 10-бѓ›бѓ“бѓ”');
    }
  }
}

// -------------------------------------------------------------
// Interactive Recharts / SVG Chart Rendering Logic
// -------------------------------------------------------------
function initRechartsOrFallback() {
  // If window.Recharts is loaded via CDN, great!
  // If offline / blocked, our custom interactive SVG renderer handles it seamlessly.
}

function renderAcademicChart() {
  const target = document.getElementById('rechartsTarget');
  if (!target) return;

  const students = appState.students;
  const subjects = appState.subjects;

  // 1. Recharts Official Library Support
  if (window.Recharts && window.React && window.ReactDOM && chartType === 'subjects') {
    try {
      const data = subjects.map(sub => {
        let sum = 0, count = 0;
        students.forEach(st => {
          const val = appState.grades[st.id]?.subjects[sub.id]?.annual;
          if (val) { sum += val; count++; }
        });
        return {
          name: sub.name.split(' ')[0],
          fullName: sub.name,
          average: count > 0 ? Math.round((sum / count) * 10) / 10 : 8.0
        };
      });

      const { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } = window.Recharts;
      const e = window.React.createElement;

      const chartElement = e(ResponsiveContainer, { width: '100%', height: 320 },
        e(BarChart, { data: data, margin: { top: 20, right: 30, left: 0, bottom: 45 } },
          e(CartesianGrid, { strokeDasharray: '3 3', stroke: '#e2e8f0' }),
          e(XAxis, { 
            dataKey: 'name', 
            angle: -35, 
            textAnchor: 'end', 
            interval: 0,
            tick: { fontSize: 11, fill: '#475569', fontWeight: 600 } 
          }),
          e(YAxis, { domain: [0, 10], tick: { fontSize: 11, fill: '#475569' } }),
          e(Tooltip, { 
            formatter: (val) => [`${val} бѓҐбѓЈбѓљбѓђ`, 'бѓЎбѓђбѓЁбѓЈбѓђбѓљбѓќ'],
            labelFormatter: (label, arr) => arr && arr[0] ? arr[0].payload.fullName : label,
            contentStyle: { backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }
          }),
          e(ReferenceLine, { 
            y: 8.0, 
            stroke: '#6366f1', 
            strokeDasharray: '4 4', 
            label: { value: 'бѓЎбѓђбѓ›бѓбѓ–бѓњбѓ” бѓ–бѓ¦бѓ•бѓђбѓ бѓ (8.0)', fill: '#4f46e5', fontSize: 11, position: 'top' } 
          }),
          e(Bar, { dataKey: 'average', fill: '#4f46e5', radius: [6, 6, 0, 0] })
        )
      );

      if (!target._reactRoot) {
        target.innerHTML = '';
        target._reactRoot = window.ReactDOM.createRoot(target);
      }
      target._reactRoot.render(chartElement);
      return;
    } catch (err) {
      console.warn('Recharts render fallback to SVG:', err);
    }
  }

  // 2. Custom High-Performance SVG / Visual Chart Engine
  if (chartType === 'subjects') {
    // Subject Averages Bar Chart
    const data = subjects.map(sub => {
      let sum = 0, count = 0;
      students.forEach(st => {
        const val = appState.grades[st.id]?.subjects[sub.id]?.annual;
        if (val) { sum += val; count++; }
      });
      return {
        name: sub.name.split(' ')[0],
        fullName: sub.name,
        average: count > 0 ? Math.round((sum / count) * 10) / 10 : 8.0
      };
    });

    renderSVGBarChart(target, data, 'бѓЎбѓђбѓ’бѓњбѓ”бѓ‘бѓбѓЎ бѓ›бѓбѓ®бѓ”бѓ“бѓ•бѓбѓ— бѓЎбѓђбѓЁбѓЈбѓђбѓљбѓќ бѓҐбѓЈбѓљбѓђ (1-10)');
  } else if (chartType === 'distribution') {
    // Grade Category Distribution
    let high = 0, good = 0, satisfactory = 0, low = 0;
    students.forEach(st => {
      const avg = appState.grades[st.id]?.annualAvg || 8.0;
      if (avg >= 9.0) high++;
      else if (avg >= 7.0) good++;
      else if (avg >= 5.0) satisfactory++;
      else low++;
    });

    const distData = [
      { label: 'бѓ¬бѓђбѓ бѓ©бѓбѓњбѓ”бѓ‘бѓЈбѓљбѓ (9.0вЂ“10.0)', count: high, color: '#10b981', percent: Math.round((high / students.length) * 100) },
      { label: 'бѓ™бѓђбѓ бѓ’бѓ (7.0вЂ“8.9)', count: good, color: '#3b82f6', percent: Math.round((good / students.length) * 100) },
      { label: 'бѓ“бѓђбѓ›бѓђбѓ™бѓ›бѓђбѓ§бѓќбѓ¤бѓбѓљбѓ”бѓ‘бѓ”бѓљбѓ (5.0вЂ“6.9)', count: satisfactory, color: '#f59e0b', percent: Math.round((satisfactory / students.length) * 100) },
      { label: 'бѓ’бѓђбѓЎбѓђбѓЈбѓ›бѓЇбѓќбѓ‘бѓ”бѓЎбѓ”бѓ‘бѓ”бѓљбѓ (< 5.0)', count: low, color: '#ef4444', percent: Math.round((low / students.length) * 100) }
    ];

    renderDistributionChart(target, distData);
  } else if (chartType === 'ranking') {
    // Top 10 Student Rankings
    const ranked = [...students].map(st => ({
      name: `${st.firstName} ${st.lastName}`,
      gpa: appState.grades[st.id]?.annualAvg || 8.0
    })).sort((a, b) => b.gpa - a.gpa).slice(0, 10);

    renderSVGRankingChart(target, ranked);
  }
}

// Custom High-Quality SVG Bar Chart
function renderSVGBarChart(container, data, title) {
  const width = Math.min(1000, container.clientWidth || 800);
  const height = 300;
  const padding = { top: 30, right: 20, bottom: 60, left: 45 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const barWidth = Math.max(16, (innerWidth / data.length) - 10);

  const maxVal = 10;
  const yScale = val => innerHeight - (val / maxVal) * innerHeight;

  let barsHTML = '';
  data.forEach((d, i) => {
    const x = padding.left + i * (innerWidth / data.length) + ((innerWidth / data.length) - barWidth) / 2;
    const y = padding.top + yScale(d.average);
    const barHeight = innerHeight - yScale(d.average);
    const color = d.average >= 9 ? '#10b981' : d.average >= 8 ? '#4338ca' : d.average >= 7 ? '#6366f1' : '#f59e0b';

    barsHTML += `
      <g class="bar-group group cursor-pointer">
        <rect 
          x="${x}" 
          y="${y}" 
          width="${barWidth}" 
          height="${barHeight}" 
          rx="6" 
          fill="${color}" 
          class="transition-all duration-300 hover:opacity-80">
          <title>${d.fullName}: ${d.average} бѓҐбѓЈбѓљбѓђ</title>
        </rect>
        <text 
          x="${x + barWidth / 2}" 
          y="${y - 6}" 
          text-anchor="middle" 
          font-size="11" 
          font-weight="bold" 
          fill="#1e293b">${d.average}</text>
        <text 
          x="${x + barWidth / 2}" 
          y="${height - padding.bottom + 18}" 
          text-anchor="end" 
          transform="rotate(-40, ${x + barWidth / 2}, ${height - padding.bottom + 18})"
          font-size="10" 
          font-weight="600" 
          fill="#64748b">${d.name}</text>
      </g>
    `;
  });

  // Grid lines
  let gridHTML = '';
  [2, 4, 6, 8, 10].forEach(val => {
    const y = padding.top + yScale(val);
    gridHTML += `
      <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#e2e8f0" stroke-dasharray="3,3" />
      <text x="${padding.left - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="#94a3b8">${val}</text>
    `;
  });

  container.innerHTML = `
    <div class="w-full flex flex-col items-center">
      <svg viewBox="0 0 ${width} ${height}" class="w-full max-w-4xl overflow-visible">
        ${gridHTML}
        <!-- Reference line for target (8.0) -->
        <line x1="${padding.left}" y1="${padding.top + yScale(8.0)}" x2="${width - padding.right}" y2="${padding.top + yScale(8.0)}" stroke="#818cf8" stroke-width="1.5" stroke-dasharray="5,3" />
        <text x="${width - padding.right - 5}" y="${padding.top + yScale(8.0) - 5}" text-anchor="end" font-size="10" fill="#6366f1" font-weight="bold">бѓЎбѓђбѓ›бѓбѓ–бѓњбѓ” бѓ–бѓ¦бѓ•бѓђбѓ бѓ (8.0)</text>
        ${barsHTML}
      </svg>
      <div class="mt-2 text-xs text-slate-500 font-medium">бѓЎбѓђбѓ’бѓњбѓ”бѓ‘бѓбѓЎ бѓ©бѓђбѓ›бѓќбѓњбѓђбѓ—бѓ•бѓђбѓљбѓ (бѓЎбѓђбѓЁбѓЈбѓђбѓљбѓќ бѓҐбѓЈбѓљбѓђ бѓ™бѓљбѓђбѓЎбѓЁбѓ)</div>
    </div>
  `;
}

// Distribution Chart
function renderDistributionChart(container, distData) {
  container.innerHTML = `
    <div class="w-full max-w-2xl py-4 space-y-4">
      <h4 class="text-sm font-bold text-slate-900 text-center mb-4">бѓ™бѓљбѓђбѓЎбѓбѓЎ бѓ›бѓќбѓЎбѓ¬бѓђбѓ•бѓљбѓ”бѓ—бѓђ бѓ’бѓђбѓњбѓђбѓ¬бѓбѓљбѓ”бѓ‘бѓђ бѓђбѓ™бѓђбѓ“бѓ”бѓ›бѓбѓЈбѓ бѓ бѓ“бѓќбѓњбѓ”бѓ”бѓ‘бѓбѓЎ бѓ›бѓбѓ®бѓ”бѓ“бѓ•бѓбѓ—</h4>
      ${distData.map(d => `
        <div class="space-y-1">
          <div class="flex items-center justify-between text-xs font-semibold">
            <span class="text-slate-800 flex items-center gap-2">
              <span class="w-3 h-3 rounded-full" style="background-color: ${d.color}"></span>
              ${d.label}
            </span>
            <span class="font-mono text-slate-600">${d.count} бѓ›бѓќбѓЎбѓ¬бѓђбѓ•бѓљбѓ” (${d.percent}%)</span>
          </div>
          <div class="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
            <div class="h-full rounded-full transition-all duration-500" style="width: ${d.percent}%; background-color: ${d.color}"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// Top Student Rankings Chart
function renderSVGRankingChart(container, rankedData) {
  container.innerHTML = `
    <div class="w-full max-w-2xl py-2 space-y-2">
      <h4 class="text-sm font-bold text-slate-900 text-center mb-3">бѓ™бѓљбѓђбѓЎбѓбѓЎ бѓўбѓќбѓћ-10 бѓ¬бѓђбѓ бѓ›бѓђбѓўбѓ”бѓ‘бѓЈбѓљбѓ бѓ›бѓќбѓЎбѓ¬бѓђбѓ•бѓљбѓ” (бѓЎбѓђбѓЁбѓЈбѓђбѓљбѓќ бѓ¬бѓљбѓбѓЈбѓ бѓ GPA)</h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        ${rankedData.map((st, i) => `
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="w-7 h-7 rounded-lg ${i < 3 ? 'bg-amber-100 text-amber-800 font-black' : 'bg-slate-200 text-slate-700 font-bold'} text-xs flex items-center justify-center font-mono">
                ${i + 1}
              </span>
              <span class="text-xs font-bold text-slate-900">${st.name}</span>
            </div>
            <span class="text-xs font-mono font-extrabold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
              ${st.gpa}
            </span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// 9. Section 8: бѓ›бѓќбѓЎбѓ¬бѓђбѓ•бѓљбѓбѓЎ бѓ–бѓќбѓ’бѓђбѓ“бѓ бѓ“бѓђбѓ®бѓђбѓЎбѓбѓђбѓ—бѓ”бѓ‘бѓђ
// -------------------------------------------------------------
function renderCharacterizationView() {
  const students = appState.students;
  const currentStudent = students.find(s => s.id === activeStudentIdForChar) || students[0];
  const char = appState.characterizations[currentStudent?.id] || {
    academic: '', behavior: '', social: '', interests: '', strengths: '', recommendations: ''
  };

  return `
    <div class="space-y-6 animate-fade-in">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left: Student Selector List -->
        <div class="lg:col-span-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col h-[700px]">
          <div class="pb-3 border-b border-slate-100 mb-3">
            <h3 class="text-sm font-bold text-slate-900 mb-2">бѓ›бѓќбѓЎбѓ¬бѓђбѓ•бѓљбѓбѓЎ бѓђбѓ бѓ©бѓ”бѓ•бѓђ (${students.length})</h3>
            <div class="relative">
              <svg class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input 
                type="text" 
                placeholder="бѓ›бѓќбѓ«бѓ”бѓ‘бѓњбѓ”бѓ— бѓЎбѓбѓђбѓЁбѓ..." 
                oninput="filterCharStudents(this.value)"
                class="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div id="charStudentsList" class="flex-1 overflow-y-auto space-y-1 pr-1">
            ${students.map(st => {
              const isSelected = st.id === currentStudent?.id;
              const gpa = appState.grades[st.id]?.annualAvg || 8.5;
              return `
                <button 
                  onclick="selectCharStudent(${st.id})"
                  class="w-full text-left p-2.5 rounded-xl transition flex items-center justify-between ${
                    isSelected ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-slate-50 text-slate-700'
                  }">
                  <div class="flex items-center gap-2">
                    <span class="w-7 h-7 rounded-full ${isSelected ? 'bg-indigo-700 text-white' : 'bg-indigo-50 text-indigo-700'} text-xs font-bold flex items-center justify-center">
                      ${st.firstName.charAt(0)}
                    </span>
                    <span class="text-xs font-bold">${st.firstName} ${st.lastName}</span>
                  </div>
                  <span class="text-[11px] font-mono font-bold ${isSelected ? 'text-indigo-200' : 'text-slate-400'}">
                    GPA: ${gpa}
                  </span>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Right: Comprehensive Characterization Form & Sheet -->
        <div class="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div class="space-y-5">
            <!-- Student Profile Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
              <div class="flex items-center gap-3.5">
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white font-bold text-lg flex items-center justify-center shadow-md">
                  ${currentStudent.firstName.charAt(0)}${currentStudent.lastName.charAt(0)}
                </div>
                <div>
                  <h3 class="text-xl font-bold text-slate-900">${currentStudent.firstName} ${currentStudent.lastName}</h3>
                  <div class="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-2">
                    <span>бѓ“бѓђбѓ‘. бѓ—бѓђбѓ бѓбѓ¦бѓ: ${currentStudent.birthDate}</span>
                    <span>вЂў</span>
                    <span>бѓ›бѓЁбѓќбѓ‘бѓ”бѓљбѓ: ${currentStudent.parentName} (${currentStudent.parentStatus})</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2 no-print">
                <button onclick="saveCharacterization(${currentStudent.id})" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  <span>бѓЁбѓ”бѓњбѓђбѓ®бѓ•бѓђ</span>
                </button>
                <button onclick="window.print()" class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                  <span>бѓ‘бѓ”бѓ­бѓ“бѓ•бѓђ</span>
                </button>
              </div>
            </div>

            <!-- 6 Structured Pedagogical Blocks -->
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-800 mb-1">
                  1. бѓђбѓ™бѓђбѓ“бѓ”бѓ›бѓбѓЈбѓ бѓ бѓЈбѓњбѓђбѓ бѓ”бѓ‘бѓ бѓ“бѓђ бѓЎбѓђбѓЎбѓ¬бѓђбѓ•бѓљбѓќ бѓ›бѓбѓ“бѓ бѓ”бѓ™бѓбѓљбѓ”бѓ‘бѓ”бѓ‘бѓ (бѓ®бѓ”бѓљбѓбѓ— бѓ©бѓђбѓЎбѓђбѓ¬бѓ”бѓ бѓ бѓ•бѓ”бѓљбѓ):
                </label>
                <textarea 
                  id="ch_academic" 
                  rows="2" 
                  class="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50 leading-relaxed"
                  placeholder="бѓђбѓ¦бѓ¬бѓ”бѓ бѓ”бѓ— бѓ›бѓќбѓЎбѓ¬бѓђбѓ•бѓљбѓбѓЎ бѓђбѓ™бѓђбѓ“бѓ”бѓ›бѓбѓЈбѓ бѓ бѓбѓњбѓўбѓ”бѓ бѓ”бѓЎбѓ”бѓ‘бѓ, бѓЎбѓђбѓ§бѓ•бѓђбѓ бѓ”бѓљбѓ бѓЎбѓђбѓ’бѓњбѓ”бѓ‘бѓ бѓ“бѓђ бѓћбѓ бѓќбѓ’бѓ бѓ”бѓЎбѓ..."
                >${char.academic || ''}</textarea>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-800 mb-1">
                  2. бѓҐбѓЄбѓ”бѓ•бѓђ, бѓ“бѓбѓЎбѓЄбѓбѓћбѓљбѓбѓњбѓђ бѓ“бѓђ бѓ”бѓ›бѓќбѓЄбѓбѓЈбѓ бѓ бѓбѓњбѓўбѓ”бѓљбѓ”бѓҐбѓўбѓ:
                </label>
                <textarea 
                  id="ch_behavior" 
                  rows="2" 
                  class="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50 leading-relaxed"
                  placeholder="бѓЁбѓбѓњбѓђбѓ’бѓђбѓњбѓђбѓ¬бѓ”бѓЎбѓбѓЎ бѓ“бѓђбѓЄбѓ•бѓђ, бѓ”бѓ›бѓќбѓЄбѓбѓЈбѓ бѓ бѓЎбѓбѓ›бѓ¬бѓбѓ¤бѓ”, бѓћбѓЈбѓњбѓҐбѓўбѓЈбѓђбѓљбѓЈбѓ бѓќбѓ‘бѓђ..."
                >${char.behavior || ''}</textarea>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-800 mb-1">
                  3. бѓ™бѓќбѓ›бѓЈбѓњбѓбѓ™бѓђбѓЄбѓбѓђ, бѓ—бѓђбѓњбѓђбѓўбѓќбѓљбѓ”бѓ‘бѓ—бѓђбѓњ бѓ“бѓђ бѓћбѓ”бѓ“бѓђбѓ’бѓќбѓ’бѓ”бѓ‘бѓ—бѓђбѓњ бѓЈбѓ бѓ—бѓбѓ”бѓ бѓ—бѓќбѓ‘бѓђ:
                </label>
                <textarea 
                  id="ch_social" 
                  rows="2" 
                  class="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50 leading-relaxed"
                  placeholder="бѓ—бѓђбѓњбѓђбѓ›бѓЁбѓ бѓќбѓ›бѓљбѓќбѓ‘бѓђ бѓ’бѓЈбѓњбѓ“бѓЁбѓ, бѓ”бѓ›бѓћбѓђбѓ—бѓбѓђ, бѓ™бѓќбѓњбѓ¤бѓљбѓбѓҐбѓўбѓбѓЎ бѓ’бѓђбѓ“бѓђбѓ­бѓ бѓђ..."
                >${char.social || ''}</textarea>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-800 mb-1">
                  4. бѓбѓњбѓўбѓ”бѓ бѓ”бѓЎбѓ”бѓ‘бѓ, бѓ°бѓќбѓ‘бѓ бѓ“бѓђ бѓ™бѓљбѓђбѓЎбѓ’бѓђбѓ бѓ”бѓЁбѓ” бѓђбѓҐбѓўбѓбѓ•бѓќбѓ‘бѓ”бѓ‘бѓ:
                </label>
                <textarea 
                  id="ch_interests" 
                  rows="2" 
                  class="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50 leading-relaxed"
                  placeholder="бѓЎбѓћбѓќбѓ бѓўбѓ, бѓ®бѓ”бѓљбѓќбѓ•бѓњбѓ”бѓ‘бѓђ, бѓ›бѓЈбѓЎбѓбѓ™бѓђ, бѓќбѓљбѓбѓ›бѓћбѓбѓђбѓ“бѓ”бѓ‘бѓ..."
                >${char.interests || ''}</textarea>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-800 mb-1">
                  5. бѓ«бѓљбѓбѓ”бѓ бѓ бѓ›бѓ®бѓђбѓ бѓ”бѓ”бѓ‘бѓ бѓ“бѓђ бѓњбѓбѓ­бѓбѓ”бѓ бѓ”бѓ‘бѓђ:
                </label>
                <textarea 
                  id="ch_strengths" 
                  rows="2" 
                  class="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50 leading-relaxed"
                  placeholder="бѓ›бѓќбѓЎбѓ¬бѓђбѓ•бѓљбѓбѓЎ бѓ›бѓ—бѓђбѓ•бѓђбѓ бѓ бѓ¦бѓбѓ бѓЎбѓ”бѓ‘бѓ”бѓ‘бѓ бѓ“бѓђ бѓЈбѓњбѓђбѓ бѓ”бѓ‘бѓ..."
                >${char.strengths || ''}</textarea>
              </div>

              <div>
                <label class="block text-xs font-bold text-indigo-900 mb-1">
                  6. бѓ“бѓђбѓ›бѓ бѓбѓ’бѓ”бѓ‘бѓљбѓбѓЎ бѓ бѓ”бѓ™бѓќбѓ›бѓ”бѓњбѓ“бѓђбѓЄбѓбѓ”бѓ‘бѓ бѓ“бѓђ бѓЎбѓђбѓ›бѓќбѓ›бѓђбѓ•бѓљбѓќ бѓ’бѓ”бѓ’бѓ›бѓђ:
                </label>
                <textarea 
                  id="ch_recommendations" 
                  rows="2" 
                  class="w-full p-3 text-xs sm:text-sm rounded-xl border border-indigo-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-indigo-50/30 leading-relaxed font-medium"
                  placeholder="бѓћбѓ”бѓ“бѓђбѓ’бѓќбѓ’бѓбѓЈбѓ бѓ бѓ бѓ©бѓ”бѓ•бѓ”бѓ‘бѓ бѓ›бѓЁбѓќбѓ‘бѓљбѓ”бѓ‘бѓЎбѓђ бѓ“бѓђ бѓ›бѓђбѓЎбѓ¬бѓђбѓ•бѓљбѓ”бѓ‘бѓљбѓ”бѓ‘бѓЎ..."
                >${char.recommendations || ''}</textarea>
              </div>
            </div>

            <!-- Official Print Signature Area (shown in print layout) -->
            <div class="hidden print-only pt-8 border-t border-slate-300 mt-6">
              <div class="flex justify-between items-center text-xs">
                <div>
                  <p class="font-bold">бѓ“бѓђбѓ›бѓ бѓбѓ’бѓ”бѓ‘бѓ”бѓљбѓ: _______________________ (${appState.schoolInfo.advisor})</p>
                  <p class="mt-2 text-slate-500">бѓ—бѓђбѓ бѓбѓ¦бѓ: __________________</p>
                </div>
                <div class="text-right">
                  <p class="font-bold">бѓЎбѓ™бѓќбѓљбѓбѓЎ бѓ“бѓбѓ бѓ”бѓҐбѓЄбѓбѓђ: _______________________</p>
                  <p class="mt-2 text-slate-500">бѓ‘.бѓђ. (бѓ‘бѓ”бѓ­бѓ“бѓбѓЎ бѓђбѓ“бѓ’бѓбѓљбѓ)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function selectCharStudent(id) {
  activeStudentIdForChar = id;
  renderCurrentView();
}

function filterCharStudents(query) {
  const q = query.toLowerCase();
  const listEl = document.getElementById('charStudentsList');
  if (!listEl) return;
  const buttons = listEl.querySelectorAll('button');
  buttons.forEach(btn => {
    const text = btn.innerText.toLowerCase();
    btn.style.display = text.includes(q) ? 'flex' : 'none';
  });
}

function saveCharacterization(studentId) {
  const academic = document.getElementById('ch_academic')?.value || '';
  const behavior = document.getElementById('ch_behavior')?.value || '';
  const social = document.getElementById('ch_social')?.value || '';
  const interests = document.getElementById('ch_interests')?.value || '';
  const strengths = document.getElementById('ch_strengths')?.value || '';
  const recommendations = document.getElementById('ch_recommendations')?.value || '';

  appState.characterizations[studentId] = {
    academic, behavior, social, interests, strengths, recommendations,
    updatedAt: new Date().toISOString().slice(0, 10)
  };

  saveState();
  showToast('бѓ›бѓќбѓЎбѓ¬бѓђбѓ•бѓљбѓбѓЎ бѓ“бѓђбѓ®бѓђбѓЎбѓбѓђбѓ—бѓ”бѓ‘бѓђ бѓЁбѓ”бѓњбѓђбѓ®бѓЈбѓљбѓбѓђ');
}

// -------------------------------------------------------------
// 10. Section 9: бѓЎбѓђбѓ’бѓњбѓќбѓ‘бѓ бѓбѓ•бѓ бѓЎбѓўбѓђбѓњбѓ“бѓђбѓ бѓўбѓ (National Curriculum Standard)
// -------------------------------------------------------------
function renderStandardsView() {
  const std = appState.standard;

  return `
    <div class="space-y-6 animate-fade-in">
      <!-- Title & Ministry Standard Header -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <div class="flex items-center gap-3.5 pb-4 border-b border-slate-100">
          <span class="p-3 rounded-2xl bg-indigo-50 text-indigo-700">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
          </span>
          <div>
            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">бѓ”бѓ бѓќбѓ•бѓњбѓЈбѓљбѓ бѓЎбѓђбѓЎбѓ¬бѓђбѓ•бѓљбѓќ бѓ’бѓ”бѓ’бѓ›бѓђ (бѓ”бѓЎбѓ’)</span>
            <h3 class="text-lg font-bold text-slate-900 mt-1">${std.curriculumTitle}</h3>
            <p class="text-xs text-slate-500">бѓЎбѓђбѓҐбѓђбѓ бѓ—бѓ•бѓ”бѓљбѓќбѓЎ бѓ’бѓђбѓњбѓђбѓ—бѓљбѓ”бѓ‘бѓбѓЎбѓђ бѓ“бѓђ бѓ›бѓ”бѓЄбѓњбѓбѓ”бѓ бѓ”бѓ‘бѓбѓЎ бѓЎбѓђбѓ›бѓбѓњбѓбѓЎбѓўбѓ бѓќбѓЎ бѓЎбѓђбѓ’бѓђбѓњбѓ›бѓђбѓњбѓђбѓ—бѓљбѓ”бѓ‘бѓљбѓќ бѓЎбѓўбѓђбѓњбѓ“бѓђбѓ бѓўбѓ”бѓ‘бѓ</p>
          </div>
        </div>

        <!-- Cross-cutting competencies (бѓ’бѓђбѓ›бѓ­бѓќбѓљбѓ бѓ™бѓќбѓ›бѓћбѓ”бѓўбѓ”бѓњбѓЄбѓбѓ”бѓ‘бѓ) -->
        <div class="mt-6">
          <h4 class="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-indigo-600"></span>
            бѓ’бѓђбѓ›бѓ­бѓќбѓљбѓ бѓ™бѓќбѓ›бѓћбѓ”бѓўбѓ”бѓњбѓЄбѓбѓ”бѓ‘бѓ (Cross-cutting Competencies)
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            ${std.crossCompetencies.map(c => `
              <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/70 hover:bg-indigo-50/30 transition">
                <div class="text-xs font-bold text-indigo-900 mb-1">${c.name}</div>
                <div class="text-xs text-slate-600 leading-relaxed">${c.desc}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Assessment System (бѓЁбѓ”бѓ¤бѓђбѓЎбѓ”бѓ‘бѓбѓЎ бѓЎбѓбѓЎбѓўбѓ”бѓ›бѓђ) -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <h4 class="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
          бѓЁбѓ”бѓ¤бѓђбѓЎбѓ”бѓ‘бѓбѓЎ бѓЎбѓбѓЎбѓўбѓ”бѓ›бѓђ бѓ“бѓђ бѓћбѓ бѓбѓњбѓЄбѓбѓћбѓ”бѓ‘бѓ
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <div class="text-xs font-bold text-slate-900 mb-1">бѓЁбѓ”бѓ¤бѓђбѓЎбѓ”бѓ‘бѓбѓЎ бѓЁбѓ™бѓђбѓљбѓђ</div>
            <div class="text-xs text-slate-600 leading-relaxed">${std.assessmentSystem.scale}</div>
          </div>
          <div class="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200/70">
            <div class="text-xs font-bold text-emerald-900 mb-1">бѓ’бѓђбѓњбѓ›бѓђбѓ•бѓбѓ—бѓђбѓ бѓ”бѓ‘бѓ”бѓљбѓ бѓЁбѓ”бѓ¤бѓђбѓЎбѓ”бѓ‘бѓђ</div>
            <div class="text-xs text-slate-600 leading-relaxed">${std.assessmentSystem.formative}</div>
          </div>
          <div class="p-4 rounded-xl bg-blue-50/40 border border-blue-200/70">
            <div class="text-xs font-bold text-blue-900 mb-1">бѓ’бѓђбѓњбѓ›бѓЎбѓђбѓ–бѓ¦бѓ•бѓ бѓ”бѓљбѓ бѓЁбѓ”бѓ¤бѓђбѓЎбѓ”бѓ‘бѓђ</div>
            <div class="text-xs text-slate-600 leading-relaxed">${std.assessmentSystem.summative}</div>
          </div>
        </div>
      </div>

      <!-- Homeroom Teacher Duties (бѓ“бѓђбѓ›бѓ бѓбѓ’бѓ”бѓ‘бѓљбѓбѓЎ бѓ¤бѓЈбѓњбѓҐбѓЄбѓбѓђ-бѓ›бѓќбѓ•бѓђбѓљбѓ”бѓќбѓ‘бѓ”бѓ‘бѓ) -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <h4 class="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-amber-600"></span>
          бѓ™бѓљбѓђбѓЎбѓбѓЎ бѓ“бѓђбѓ›бѓ бѓбѓ’бѓ”бѓ‘бѓљбѓбѓЎ бѓћбѓ бѓќбѓ¤бѓ”бѓЎбѓбѓЈбѓљбѓ бѓЎбѓўбѓђбѓњбѓ“бѓђбѓ бѓўбѓ бѓ“бѓђ бѓ›бѓќбѓ•бѓђбѓљбѓ”бѓќбѓ‘бѓ”бѓ‘бѓ
        </h4>
        <div class="space-y-2">
          ${std.advisorDuties.map((duty, idx) => `
            <div class="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-200/60">
              <span class="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                ${idx + 1}
              </span>
              <span class="text-xs sm:text-sm text-slate-700 leading-relaxed">${duty}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Custom Notes & Internal School Standard (бѓ®бѓ”бѓљбѓбѓ— бѓЁбѓ”бѓЎбѓђбѓ•бѓЎбѓ”бѓ‘бѓ бѓ•бѓ”бѓљбѓ) -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-sm font-bold text-slate-900">бѓЎбѓ™бѓќбѓљбѓбѓЎ бѓЁбѓбѓ“бѓђ бѓЎбѓўбѓђбѓњбѓ“бѓђбѓ бѓўбѓ”бѓ‘бѓ бѓ“бѓђ бѓ“бѓђбѓ›бѓ бѓбѓ’бѓ”бѓ‘бѓљбѓбѓЎ бѓЁбѓ”бѓњбѓбѓЁбѓ•бѓњбѓ”бѓ‘бѓ</h4>
          <span class="text-[11px] text-indigo-600 font-semibold">бѓђбѓ•бѓўбѓќбѓ›бѓђбѓўбѓЈбѓ бѓђбѓ“ бѓбѓњбѓђбѓ®бѓ”бѓ‘бѓђ</span>
        </div>
        <textarea 
          rows="4" 
          onchange="updateTeacherStandardNotes(this.value)"
          class="w-full p-3.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50 leading-relaxed"
          placeholder="бѓЁбѓ”бѓбѓ§бѓ•бѓђбѓњбѓ”бѓ— бѓ™бѓљбѓђбѓЎбѓбѓЎбѓђ бѓ“бѓђ бѓЎбѓ™бѓќбѓљбѓбѓЎ бѓЁбѓбѓ“бѓђ бѓЎбѓўбѓђбѓњбѓ“бѓђбѓ бѓўбѓ”бѓ‘бѓ, бѓбѓњбѓ“бѓбѓ•бѓбѓ“бѓЈбѓђбѓљбѓЈбѓ бѓ бѓ›бѓбѓ–бѓњбѓ”бѓ‘бѓ бѓђбѓњ бѓ›бѓбѓ—бѓбѓ—бѓ”бѓ‘бѓ”бѓ‘бѓ..."
        >${std.teacherCustomNotes || ''}</textarea>
      </div>
    </div>
  `;
}

function updateTeacherStandardNotes(val) {
  appState.standard.teacherCustomNotes = val;
  saveState();
}
