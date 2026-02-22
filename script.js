/**
 * ============================================================
 *  BFL TV - Multi-Watch YouTube Live Stream
 * ============================================================
 *
 *  CONFIGURATION: Edit the CHANNELS array below to set which
 *  YouTube channels appear automatically on the page.
 *
 *  Each channel entry requires:
 *    - id       : The YouTube Channel ID (from the channel URL)
 *    - name     : Display name shown in the UI
 *
 *  HOW TO FIND A CHANNEL ID:
 *    1. Go to the YouTube channel page
 *    2. View page source or check the URL
 *    3. The channel ID looks like: UCxxxxxxxxxxxxxxxxxxxxxxxxx
 *
 *  The player will embed the channel's live stream automatically
 *  using the YouTube embed with the channel ID.
 *
 * ============================================================
 */

const CHANNELS = [
  // -------- CONFIGURE YOUR CHANNELS HERE --------
  { id: "UCJTq8YQXj-2_BNgwis4SGsg",  name: "RonnyBons"        },
  { id: "UChEzBCVwQg3EC7QjsF3iZHw",  name: "ZotaFrz"          },
  { id: "UCBu6n7CY3k_HdX8THmyEOEw",  name: "Abeegel"          },
  { id: "UCz4s1BgKNXTwOHO0PHQHQxQ",  name: "Kafeyinhere"      },
  { id: "UCsUhlZAanKWUsZxqbPbjAOw",  name: "Fahrul Reyza"     },
  { id: "UCZHSRSIP9m2uxOAOlVJGytw",  name: "Danny"            },
  { id: "UCamUqGw_jBciNhBNwBcJFRg",  name: "Nathann"          },
  { id: "UCKciWscgYbPCuAdtX91x06w",  name: "Deplonnn"         },
  { id: "UCvrhggVJsdR6uYvuIrX_Grg",  name: "Dipiwww"          },
  { id: "UCrvlbX01F8qtXlJDXX7czVg",  name: "Rey"              },
  { id: "UCYKxEdT_OBIUv7_zJkyQkdg",  name: "AndreMemet"       },
  { id: "UCQV0qkau8jIHyn5iRY6bIcg",  name: "Syacei"           },
  { id: "UCKN2A4ShReXSHJER9_lfwLw",  name: "Bopeng16"         },
  // -------- ADD MORE CHANNELS BELOW --------
  // { id: "UCxxxxxxxxxxxxxxx", name: "Channel Name" },
];

// ============================================================
//  STATE
// ============================================================

let currentLayout = 4;
let activeChannels = [];

// ============================================================
//  DOM REFERENCES
// ============================================================

const videoGrid     = document.getElementById("videoGrid");
const channelList   = document.getElementById("channelList");
const channelCount  = document.getElementById("channelCount");
const btnLayout     = document.getElementById("btnLayout");
const layoutModal   = document.getElementById("layoutModal");
const modalClose    = document.getElementById("modalClose");
const layoutOptions = document.querySelectorAll(".layout-option");

// ============================================================
//  INITIALIZATION
// ============================================================

function init() {
  activeChannels = CHANNELS.slice(0, currentLayout);
  renderChannelBar();
  renderGrid();
  setupEventListeners();
}

// ============================================================
//  RENDER FUNCTIONS
// ============================================================

function renderGrid() {
  videoGrid.setAttribute("data-layout", currentLayout);
  videoGrid.innerHTML = "";

  const slots = currentLayout;

  for (let i = 0; i < slots; i++) {
    const channel = activeChannels[i] || null;
    const card = createPlayerCard(channel, i);
    videoGrid.appendChild(card);
  }
}

function createPlayerCard(channel, index) {
  const card = document.createElement("div");
  card.className = "player-card" + (channel ? " loaded" : "");
  card.dataset.index = index;

  const wrapper = document.createElement("div");
  wrapper.className = "player-wrapper";

  if (channel) {
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/live_stream?channel=${channel.id}&autoplay=1&mute=1`;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.loading = "lazy";
    wrapper.appendChild(iframe);
  }

  // Overlay placeholder
  const overlay = document.createElement("div");
  overlay.className = "player-overlay";
  overlay.innerHTML = `
    <div class="player-placeholder">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="2" y="4" width="20" height="16" rx="3"/>
        <path d="M10 9l5 3-5 3V9z"/>
      </svg>
      <p>No stream assigned</p>
    </div>
  `;
  wrapper.appendChild(overlay);

  // Info bar
  const info = document.createElement("div");
  info.className = "player-info";

  if (channel) {
    info.innerHTML = `
      <span class="player-channel-name">${escapeHtml(channel.name)}</span>
      <span class="player-badge">
        <span class="player-badge-dot"></span>
        LIVE
      </span>
    `;
  } else {
    info.innerHTML = `<span class="player-channel-name" style="color: var(--text-muted);">Empty slot</span>`;
  }

  card.appendChild(wrapper);
  card.appendChild(info);

  return card;
}

function renderChannelBar() {
  channelList.innerHTML = "";
  channelCount.textContent = CHANNELS.length;

  CHANNELS.forEach((channel, idx) => {
    const badge = document.createElement("div");
    const isActive = activeChannels.some((c) => c.id === channel.id);
    badge.className = "channel-badge" + (isActive ? " active" : "");
    badge.dataset.channelIndex = idx;

    const initials = channel.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    badge.innerHTML = `
      <div class="channel-badge-avatar">${initials}</div>
      <span class="channel-badge-name">${escapeHtml(channel.name)}</span>
      <span class="channel-badge-status"></span>
    `;

    badge.addEventListener("click", () => toggleChannel(idx));
    channelList.appendChild(badge);
  });
}

// ============================================================
//  CHANNEL MANAGEMENT
// ============================================================

function toggleChannel(channelIndex) {
  const channel = CHANNELS[channelIndex];
  const existingIdx = activeChannels.findIndex((c) => c.id === channel.id);

  if (existingIdx !== -1) {
    // Remove channel from active list
    activeChannels.splice(existingIdx, 1);
  } else {
    if (activeChannels.length >= currentLayout) {
      // Replace the last slot
      activeChannels[currentLayout - 1] = channel;
    } else {
      activeChannels.push(channel);
    }
  }

  renderChannelBar();
  renderGrid();
}

// ============================================================
//  LAYOUT MANAGEMENT
// ============================================================

function setLayout(count) {
  currentLayout = count;

  // Adjust active channels to fit layout
  if (activeChannels.length > currentLayout) {
    activeChannels = activeChannels.slice(0, currentLayout);
  }

  // Update active state on layout buttons
  layoutOptions.forEach((opt) => {
    opt.classList.toggle("active", parseInt(opt.dataset.layout) === currentLayout);
  });

  renderGrid();
  renderChannelBar();
  closeModal();
}

function openModal() {
  layoutModal.classList.add("open");
}

function closeModal() {
  layoutModal.classList.remove("open");
}

// ============================================================
//  EVENT LISTENERS
// ============================================================

function setupEventListeners() {
  btnLayout.addEventListener("click", openModal);
  modalClose.addEventListener("click", closeModal);

  layoutModal.addEventListener("click", (e) => {
    if (e.target === layoutModal) closeModal();
  });

  layoutOptions.forEach((opt) => {
    opt.addEventListener("click", () => {
      const count = parseInt(opt.dataset.layout);
      setLayout(count);
    });
  });

  // Keyboard shortcut: Escape closes modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // Keyboard shortcuts for layouts
  document.addEventListener("keydown", (e) => {
    if (layoutModal.classList.contains("open")) return;
    if (e.key === "1") setLayout(1);
    if (e.key === "2") setLayout(2);
    if (e.key === "4") setLayout(4);
    if (e.key === "6") setLayout(6);
    if (e.key === "9") setLayout(9);
  });
}

// ============================================================
//  UTILITIES
// ============================================================

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ============================================================
//  START
// ============================================================

document.addEventListener("DOMContentLoaded", init);
