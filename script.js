/**
 * FOR ARSH ♡ - ROMANTIC DIGITAL LOVE MINI-LETTER
 * Features:
 * - Background Music: "Neethanae Neethane" from Mersal (Vijay, A.R. Rahman, Shreya Ghoshal)
 * - Autoplay with cute "Play our song ♡" fallback if blocked
 * - Beautiful music player with rotating heart icon
 * - Special romantic moment: "Yaachey Yaachey ♡" soft fade-in animation
 * - Realistic lipstick kiss mark interaction
 * - Floating ambient hearts canvas
 */

(function () {
  'use strict';

  // ========================================================
  // 1. STATE & CONFIGURATION
  // ========================================================
  const CONFIG = {
    // YouTube Video ID for "Neethanae Neethane" from Mersal (Official Lyric Video / Sony Music South)
    ytVideoId: 'fWajtP80g54',
    // Fallback YouTube ID if first has restrictions:
    ytFallbackId: '1gXg2f-k9oY',
    // The romantic moment time in the song when "Yaachey Yaachey" is sung (~48 seconds in)
    romanticMomentTime: 48,
    // Auto-reveal delay in seconds (if song isn't started or user is reading leisurely)
    autoRevealSeconds: 12
  };

  const state = {
    isPlaying: false,
    isMuted: false,
    duration: 300, // default estimation
    currentTime: 0,
    hasInteracted: false,
    momentTriggered: false,
    ytPlayer: null,
    ytReady: false,
    useNativeAudio: false,
    webAudioCtx: null
  };

  // DOM Elements
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const heartDisc = document.getElementById('heartDisc');
  const volumeBtn = document.getElementById('volumeBtn');
  const volIcon = document.getElementById('volIcon');
  const progressTrack = document.getElementById('progressTrack');
  const progressFill = document.getElementById('progressFill');
  const autoplayInvitation = document.getElementById('autoplayInvitation');
  const cutePlayBtn = document.getElementById('cutePlayBtn');
  const momentShortcutBtn = document.getElementById('momentShortcutBtn');
  const romanticMomentBox = document.getElementById('romanticMomentBox');
  const lipstickKiss = document.getElementById('lipstickKiss');
  const nativeAudio = document.getElementById('nativeAudio');
  const localAudioInput = document.getElementById('localAudioInput');
  const shareBtn = document.getElementById('shareBtn');
  const kissBurstBtn = document.getElementById('kissBurstBtn');
  const heartsCanvas = document.getElementById('heartsCanvas');

  // ========================================================
  // 2. YOUTUBE IFRAME API & AUDIO ENGINE
  // ========================================================

  // YouTube API callback when script loads
  window.onYouTubeIframeAPIReady = function () {
    try {
      state.ytPlayer = new YT.Player('ytPlayer', {
        height: '180',
        width: '180',
        videoId: CONFIG.ytVideoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          loop: 1,
          playlist: CONFIG.ytVideoId,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin || '*'
        },
        events: {
          onReady: onYTPlayerReady,
          onStateChange: onYTStateChange,
          onError: onYTError
        }
      });
    } catch (e) {
      console.warn('YouTube IFrame init exception:', e);
      fallbackToNativeAudio();
    }
  };

  function onYTPlayerReady(event) {
    state.ytReady = true;
    try {
      // Attempt autoplay
      state.ytPlayer.playVideo();
      // Check if playback actually began
      setTimeout(() => {
        const playerState = state.ytPlayer.getPlayerState();
        // 1 = PLAYING, 3 = BUFFERING
        if (playerState === 1 || playerState === 3) {
          setPlayingUI(true);
          hideAutoplayInvitation();
        } else {
          showAutoplayInvitation();
        }
      }, 900);
    } catch (err) {
      showAutoplayInvitation();
    }
  }

  function onYTStateChange(event) {
    // YT.PlayerState: 1 = PLAYING, 2 = PAUSED, 0 = ENDED, 3 = BUFFERING
    if (event.data === 1) {
      setPlayingUI(true);
      hideAutoplayInvitation();
      startProgressLoop();
    } else if (event.data === 2) {
      setPlayingUI(false);
    } else if (event.data === 0) {
      // Loop song
      state.ytPlayer.seekTo(0);
      state.ytPlayer.playVideo();
    }
  }

  function onYTError(err) {
    console.warn('YouTube playback error or restriction:', err);
    fallbackToNativeAudio();
  }

  function fallbackToNativeAudio() {
    state.useNativeAudio = true;
    if (nativeAudio) {
      nativeAudio.play().then(() => {
        setPlayingUI(true);
        hideAutoplayInvitation();
      }).catch(() => {
        showAutoplayInvitation();
      });
    }
  }

  // Playback Control Wrapper
  function togglePlay() {
    if (state.isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  }

  function playAudio() {
    state.hasInteracted = true;
    hideAutoplayInvitation();

    // Try YouTube if available
    if (state.ytReady && state.ytPlayer && !state.useNativeAudio) {
      try {
        state.ytPlayer.playVideo();
        setPlayingUI(true);
        startProgressLoop();
        return;
      } catch (err) {
        console.warn('YouTube play failed, using fallback', err);
      }
    }

    // Try Native Audio element
    if (nativeAudio) {
      nativeAudio.play().then(() => {
        setPlayingUI(true);
        startProgressLoop();
      }).catch((e) => {
        console.warn('Native audio play error:', e);
        // Synthesize romantic acoustic bell melody if file not found
        playWebAudioMelody();
        setPlayingUI(true);
      });
    }
  }

  function pauseAudio() {
    if (state.ytReady && state.ytPlayer && !state.useNativeAudio) {
      try {
        state.ytPlayer.pauseVideo();
      } catch (e) {}
    }
    if (nativeAudio) {
      nativeAudio.pause();
    }
    setPlayingUI(false);
  }

  function setPlayingUI(isPlaying) {
    state.isPlaying = isPlaying;
    if (musicToggleBtn) {
      if (isPlaying) {
        musicToggleBtn.classList.add('is-playing');
        musicToggleBtn.setAttribute('title', 'Pause Song');
      } else {
        musicToggleBtn.classList.remove('is-playing');
        musicToggleBtn.setAttribute('title', 'Play Song');
      }
    }
  }

  // Volume & Mute Toggle
  function toggleMute() {
    state.isMuted = !state.isMuted;
    if (state.ytReady && state.ytPlayer && !state.useNativeAudio) {
      try {
        if (state.isMuted) {
          state.ytPlayer.mute();
        } else {
          state.ytPlayer.unMute();
        }
      } catch (e) {}
    }
    if (nativeAudio) {
      nativeAudio.muted = state.isMuted;
    }
    updateVolumeIcon(state.isMuted);
  }

  function updateVolumeIcon(isMuted) {
    if (!volIcon) return;
    if (isMuted) {
      volIcon.innerHTML = `
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <line x1="23" y1="9" x2="17" y2="15"></line>
        <line x1="17" y1="9" x2="23" y2="15"></line>
      `;
      volIcon.style.color = '#D7496C';
    } else {
      volIcon.innerHTML = `
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
      `;
      volIcon.style.color = '';
    }
  }

  // Progress Tracking & Romantic Moment Trigger
  let progressInterval = null;
  function startProgressLoop() {
    if (progressInterval) clearInterval(progressInterval);
    progressInterval = setInterval(() => {
      if (!state.isPlaying) return;

      let currentTime = 0;
      let duration = 300;

      if (state.ytReady && state.ytPlayer && !state.useNativeAudio) {
        try {
          currentTime = state.ytPlayer.getCurrentTime() || 0;
          duration = state.ytPlayer.getDuration() || 300;
        } catch (e) {}
      } else if (nativeAudio && nativeAudio.duration) {
        currentTime = nativeAudio.currentTime;
        duration = nativeAudio.duration;
      } else {
        state.currentTime += 0.5;
        currentTime = state.currentTime;
      }

      // Update progress bar
      if (progressFill && duration > 0) {
        const pct = Math.min(100, Math.max(0, (currentTime / duration) * 100));
        progressFill.style.width = pct + '%';
      }

      // Trigger "Yaachey Yaachey ♡" at the romantic moment in the song
      if (currentTime >= CONFIG.romanticMomentTime && !state.momentTriggered) {
        triggerRomanticMoment(true);
      }
    }, 450);
  }

  // Seeking via Progress Bar
  if (progressTrack) {
    progressTrack.addEventListener('click', (e) => {
      const rect = progressTrack.getBoundingClientRect();
      const clickRatio = (e.clientX - rect.left) / rect.width;
      let targetTime = 0;

      if (state.ytReady && state.ytPlayer && !state.useNativeAudio) {
        try {
          const duration = state.ytPlayer.getDuration() || 300;
          targetTime = duration * clickRatio;
          state.ytPlayer.seekTo(targetTime, true);
        } catch (e) {}
      } else if (nativeAudio && nativeAudio.duration) {
        targetTime = nativeAudio.duration * clickRatio;
        nativeAudio.currentTime = targetTime;
      }

      if (!state.isPlaying) {
        playAudio();
      }
    });
  }

  // Custom Local MP3 Picker
  if (localAudioInput) {
    localAudioInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const fileUrl = URL.createObjectURL(file);
        if (state.ytReady && state.ytPlayer) {
          try { state.ytPlayer.pauseVideo(); } catch (err) {}
        }
        state.useNativeAudio = true;
        nativeAudio.src = fileUrl;
        nativeAudio.load();
        nativeAudio.play().then(() => {
          setPlayingUI(true);
          hideAutoplayInvitation();
          showToast(`Now playing: ${file.name.replace(/\.[^/.]+$/, '')} ♡`);
        }).catch(() => {
          showToast('Tap play to start your song ♡');
        });
      }
    });
  }

  // ========================================================
  // 3. AUTOPLAY INVITATION POPUP
  // ========================================================
  function showAutoplayInvitation() {
    if (state.isPlaying || state.hasInteracted) return;
    if (autoplayInvitation) {
      autoplayInvitation.classList.add('is-visible');
    }
  }

  function hideAutoplayInvitation() {
    if (autoplayInvitation) {
      autoplayInvitation.classList.remove('is-visible');
    }
  }

  if (cutePlayBtn) {
    cutePlayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      playAudio();
      spawnHeartSparkles(e.clientX, e.clientY, 12);
    });
  }

  // User gesture listener: any click starts music if blocked
  document.addEventListener('click', function onFirstClick(e) {
    if (!state.hasInteracted && !state.isPlaying) {
      // Don't intercept specific button clicks directly
      playAudio();
    }
  }, { once: true });

  // ========================================================
  // 4. SPECIAL ROMANTIC MOMENT: "Yaachey Yaachey ♡"
  // ========================================================
  function triggerRomanticMoment(fromSong = false) {
    state.momentTriggered = true;
    if (romanticMomentBox) {
      romanticMomentBox.classList.add('is-active');

      // Scroll smoothly into view if on mobile
      if (window.innerWidth <= 640) {
        romanticMomentBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      // Spawn ambient golden & rose hearts
      const rect = romanticMomentBox.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      spawnHeartSparkles(centerX, centerY, 15);
    }
  }

  // Jump to Romantic Moment Button
  if (momentShortcutBtn) {
    momentShortcutBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Seek song to ~46s so Arsh immediately hears "Yaachey Yaachey"
      if (state.ytReady && state.ytPlayer && !state.useNativeAudio) {
        try {
          state.ytPlayer.seekTo(CONFIG.romanticMomentTime - 2, true);
          if (!state.isPlaying) state.ytPlayer.playVideo();
        } catch (err) {}
      } else if (nativeAudio && nativeAudio.duration) {
        nativeAudio.currentTime = Math.min(CONFIG.romanticMomentTime - 2, nativeAudio.duration);
        if (!state.isPlaying) nativeAudio.play();
      }

      if (!state.isPlaying) {
        playAudio();
      }

      triggerRomanticMoment(false);
      spawnHeartSparkles(e.clientX, e.clientY, 10);
      showToast('Yaachey Yaachey ♡ Playing our romantic moment!');
    });
  }

  // Fallback timer: gentle fade-in after 12s so it is always experienced
  setTimeout(() => {
    if (!state.momentTriggered) {
      triggerRomanticMoment(false);
    }
  }, CONFIG.autoRevealSeconds * 1000);

  // ========================================================
  // 5. REALISTIC LIPSTICK KISS MARK 💋 INTERACTION
  // ========================================================
  if (lipstickKiss) {
    lipstickKiss.addEventListener('click', (e) => {
      e.stopPropagation();
      playKissChime();
      spawnHeartSparkles(e.clientX, e.clientY, 16);
      showToast('A tiny kiss sent to Arsh... 💋♡');

      // Gentle wobble animation
      lipstickKiss.style.transform = 'rotate(-4deg) scale(1.22)';
      setTimeout(() => {
        lipstickKiss.style.transform = '';
      }, 400);
    });

    lipstickKiss.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        lipstickKiss.click();
      }
    });
  }

  // Sweet kiss chime sound via Web Audio API
  function playKissChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!state.webAudioCtx) state.webAudioCtx = new AudioCtx();
      const ctx = state.webAudioCtx;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      // Gentle dual-frequency romantic chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(659.25, now); // E5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

      osc2.frequency.setValueAtTime(987.77, now); // B5
      osc2.frequency.exponentialRampToValueAtTime(1318.5, now + 0.2); // E6

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.7);
      osc2.stop(now + 0.7);
    } catch (e) {
      // AudioContext not allowed or not supported, ignore silently
    }
  }

  // Romantic acoustic chime synthesizer (plays gentle opening notes of Neethanae)
  function playWebAudioMelody() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!state.webAudioCtx) state.webAudioCtx = new AudioCtx();
      const ctx = state.webAudioCtx;
      if (ctx.state === 'suspended') ctx.resume();

      // Pentatonic romantic chime sequence (A major notes)
      const notes = [440, 493.88, 554.37, 659.25, 739.99, 880];
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.45);

        gain.gain.setValueAtTime(0.001, now + idx * 0.45);
        gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.45 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.45 + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.45);
        osc.stop(now + idx * 0.45 + 1.3);
      });
    } catch (e) {}
  }

  // ========================================================
  // 6. FLOATING HEARTS CANVAS BACKGROUND
  // ========================================================
  function initHeartsCanvas() {
    if (!heartsCanvas) return;
    const ctx = heartsCanvas.getContext('2d');
    let width = (heartsCanvas.width = window.innerWidth);
    let height = (heartsCanvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = heartsCanvas.width = window.innerWidth;
      height = heartsCanvas.height = window.innerHeight;
    });

    // Particle definition
    const hearts = [];
    const maxHearts = window.innerWidth <= 640 ? 18 : 32;

    const colors = [
      'rgba(247, 181, 197, ',  // Soft blush pink
      'rgba(235, 150, 175, ',  // Petal rose
      'rgba(248, 205, 215, ',  // Ivory rose
      'rgba(215, 175, 140, ',  // Warm beige gold
      'rgba(225, 95, 130, '    // Romantic berry
    ];

    for (let i = 0; i < maxHearts; i++) {
      hearts.push(createHeart(true));
    }

    function createHeart(initial = false) {
      return {
        x: Math.random() * width,
        y: initial ? Math.random() * height : height + 20,
        size: Math.random() * 12 + 8, // 8px to 20px
        speedY: Math.random() * 0.5 + 0.35, // gentle drift
        speedX: (Math.random() - 0.5) * 0.3,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.02 + 0.01,
        colorBase: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.35 + 0.2,
        rotation: (Math.random() - 0.5) * 0.6
      };
    }

    // Draw single heart path
    function drawHeart(x, y, size, color, rotation) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillStyle = color;
      ctx.beginPath();
      const topCurveHeight = size * 0.3;
      ctx.moveTo(0, topCurveHeight);
      // Top left curve
      ctx.bezierCurveTo(-size / 2, -topCurveHeight, -size, topCurveHeight / 3, 0, size);
      // Top right curve
      ctx.bezierCurveTo(size, topCurveHeight / 3, size / 2, -topCurveHeight, 0, topCurveHeight);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Animation Loop
    function render() {
      ctx.clearRect(0, 0, width, height);

      hearts.forEach((h, idx) => {
        h.y -= h.speedY;
        h.wobble += h.wobbleSpeed;
        h.x += Math.sin(h.wobble) * 0.6 + h.speedX;

        const alpha = h.opacity * (1 - Math.max(0, (height - h.y) / height * 0.2));
        drawHeart(h.x, h.y, h.size, `${h.colorBase}${alpha})`, h.rotation);

        // Respawn when off screen
        if (h.y < -30 || h.x < -30 || h.x > width + 30) {
          hearts[idx] = createHeart(false);
        }
      });

      requestAnimationFrame(render);
    }

    render();
  }

  // ========================================================
  // 7. CLICK HEART SPARKLES & TOAST NOTIFICATIONS
  // ========================================================
  function spawnHeartSparkles(x, y, count = 8) {
    const emojis = ['♡', '💖', '✨', '💋', '🌸', '💕', '🤍'];
    for (let i = 0; i < count; i++) {
      const spark = document.createElement('span');
      spark.className = 'click-heart-spark';
      spark.textContent = emojis[Math.floor(Math.random() * emojis.length)];

      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const dist = Math.random() * 65 + 30;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist - 40;
      const rot = (Math.random() - 0.5) * 60;

      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;
      spark.style.setProperty('--tx', `${tx}px`);
      spark.style.setProperty('--ty', `${ty}px`);
      spark.style.setProperty('--rot', `${rot}deg`);

      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), 1200);
    }
  }

  // Click anywhere to drop a gentle floating heart
  document.addEventListener('click', (e) => {
    // Ignore clicks inside form controls
    if (e.target.closest('button') || e.target.closest('input')) return;
    spawnHeartSparkles(e.clientX, e.clientY, 4);
  });

  // Sweet Floating Toast Feedback
  let toastTimer = null;
  function showToast(message) {
    let toast = document.querySelector('.love-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'love-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-shown');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('is-shown');
    }, 2800);
  }

  // Footer Buttons
  if (shareBtn) {
    shareBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      spawnHeartSparkles(e.clientX, e.clientY, 8);
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href).then(() => {
          showToast('Letter link copied with love! 💌');
        }).catch(() => {
          showToast('For Arsh ♡ Sealed with eternal love!');
        });
      } else {
        showToast('For Arsh ♡ Sealed with eternal love!');
      }
    });
  }

  if (kissBurstBtn) {
    kissBurstBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      playKissChime();
      const rect = kissBurstBtn.getBoundingClientRect();
      spawnHeartSparkles(rect.left + rect.width / 2, rect.top, 25);
      showToast('Endless kisses sent to Arsh! 💋💋💋');
    });
  }

  // Event Listeners for Player
  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePlay();
      spawnHeartSparkles(e.clientX, e.clientY, 6);
    });
  }

  if (volumeBtn) {
    volumeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMute();
    });
  }

  // ========================================================
  // 8. INITIALIZATION
  // ========================================================
  initHeartsCanvas();

  // Gentle initial prompt check
  setTimeout(() => {
    if (!state.isPlaying) {
      showAutoplayInvitation();
    }
  }, 1200);

})();
