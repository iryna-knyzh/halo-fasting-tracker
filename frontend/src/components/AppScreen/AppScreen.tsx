"use client";

import { useState } from "react";
import type { User, FastSession, ActiveFast } from "@/types/fast.types";
import { fmt, dur, timeStr, dateStr, wd, getInitials } from "@/lib/utils";
import styles from "./AppScreen.module.scss";

const PALETTE = ["#ffd6ff", "#e7c6ff", "#c8b6ff", "#b8c0ff", "#bbd0ff"];
const CHIPS_BG = ["#fbeefb", "#f3ecfb", "#efebfc", "#ecedfc", "#ecf1fc"];
const GOAL_HOURS = [13, 16, 18, 20];
const C = 2 * Math.PI * 130;

interface AppScreenProps {
  user: User;
  history: FastSession[];
  fast: ActiveFast | null;
  goalHours: number;
  now: number;
  onLogout: () => void;
  onStart: () => void;
  onEnd: () => void;
  onClear: () => void;
  onSetGoal: (h: number) => void;
}

export function AppScreen({
  user,
  history,
  fast,
  goalHours,
  now,
  onLogout,
  onStart,
  onEnd,
  onClear,
  onSetGoal,
}: AppScreenProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const goalMs = goalHours * 3.6e6;
  const idle = !fast;
  const elapsed = fast ? Math.max(0, now - fast.start) : 0;
  const progress = goalMs ? elapsed / goalMs : 0;
  const reached = elapsed >= goalMs;

  const ringOffset = C * (1 - Math.min(1, progress));

  const userInitials = getInitials(user.name, user.email);

  const count = history.length;
  const avg = count
    ? history.reduce((a, s) => a + s.duration, 0) / count / 3.6e6
    : 0;
  const streak = history.filter((s) => s.duration >= goalMs).length;

  const recent = history.slice(0, 7).slice().reverse();
  const maxDur = Math.max(goalMs, ...recent.map((s) => s.duration), 3.6e6);
  const scale = maxDur * 1.12;
  const bars = recent.map((s) => ({
    hpx: Math.max(8, Math.round((s.duration / scale) * 130)),
    hLabel: (s.duration / 3.6e6).toFixed(1),
    day: wd(s.end),
    reached: s.duration >= goalMs,
  }));
  const goalLinePx = Math.min(130, Math.round((goalMs / scale) * 130));

  const histItems = history.map((s, i) => {
    const r = s.duration >= goalMs;
    return {
      color: PALETTE[i % PALETTE.length],
      chipBg: CHIPS_BG[i % CHIPS_BG.length],
      durationText: dur(s.duration),
      rangeText: `${timeStr(s.start)} → ${timeStr(s.end)}`,
      dateLabel: dateStr(s.end),
      tag: r ? "goal met" : "short",
      met: r,
    };
  });

  return (
    <div className={styles.card}>
      {/* header */}
      <div className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.logo} />
          <div>
            <div className={styles.appName}>Halo</div>
            <div className={styles.appTagline}>FASTING TRACKER</div>
          </div>
        </div>

        {/* user avatar + menu */}
        <div className={styles.userMenu}>
          <div
            role="button"
            onClick={() => setMenuOpen((o) => !o)}
            className={styles.userButton}
          >
            <span className={styles.userName}>{user.name}</span>
            <div className={styles.avatar}>{userInitials}</div>
          </div>

          {menuOpen && (
            <div className={styles.menu}>
              <div className={styles.menuUser}>
                <div className={styles.menuAvatar}>{userInitials}</div>
                <div className={styles.menuUserInfo}>
                  <div className={styles.menuUserName}>{user.name}</div>
                  <div className={styles.menuUserEmail}>{user.email}</div>
                </div>
              </div>
              <div className={styles.menuStats}>
                <div className={styles.stat}>
                  <div className={styles.statValue}>{count}</div>
                  <div className={styles.statLabel}>fasts</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statValue}>
                    {count ? avg.toFixed(1) : "0"}
                  </div>
                  <div className={styles.statLabel}>avg hours</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statValue}>{streak}</div>
                  <div className={styles.statLabel}>goal met</div>
                </div>
              </div>
              <div
                role="button"
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
                className={styles.signOut}
              >
                <span className={styles.signOutIcon} />
                Sign out
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.columns}>
        <div className={styles.mainCol}>
          {/* status pill */}
          <div className={styles.statusRow}>
            {idle ? (
              <div className={`${styles.pill} ${styles.pillIdle}`}>
                <span className={`${styles.dot} ${styles.dotIdle}`} />
                Ready to fast
              </div>
            ) : (
              <div className={`${styles.pill} ${styles.pillFasting}`}>
                <span className={`${styles.dot} ${styles.dotFasting}`} />
                Fasting now
              </div>
            )}
          </div>

          {/* ring */}
          <div className={styles.ringWrap}>
            <svg
              width="300"
              height="300"
              viewBox="0 0 300 300"
              className={styles.ringSvg}
            >
              <defs>
                <linearGradient id="ringgrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#e7c6ff" />
                  <stop offset="50%" stopColor="#c8b6ff" />
                  <stop offset="100%" stopColor="#bbd0ff" />
                </linearGradient>
              </defs>
              <circle
                cx="150"
                cy="150"
                r="130"
                fill="none"
                stroke="#efeaf7"
                strokeWidth="20"
              />
              <circle
                cx="150"
                cy="150"
                r="130"
                fill="none"
                stroke="url(#ringgrad)"
                strokeWidth="20"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={ringOffset}
                transform="rotate(-90 150 150)"
                className={styles.ringProgress}
              />
            </svg>
            <div className={styles.ringCenter}>
              {idle ? (
                <div
                  role="button"
                  onClick={onStart}
                  className={styles.startButton}
                >
                  <div className={styles.startLabel}>Start</div>
                  <div className={styles.startHint}>tap to begin</div>
                </div>
              ) : (
                <>
                  <div className={styles.elapsedLabel}>ELAPSED</div>
                  <div className={styles.elapsedTime}>{fmt(elapsed)}</div>
                  <div
                    className={`${styles.goalStatus} ${reached ? styles.goalStatusReached : ""}`}
                  >
                    {reached
                      ? "Goal reached · keep going"
                      : `${Math.round(progress * 100)}% of ${goalHours}h goal`}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* controls */}
          <div className={styles.controls}>
            {idle ? (
              <div className={styles.goalPicker}>
                <div className={styles.controlHint}>
                  Choose your fasting goal
                </div>
                <div className={styles.goalChips}>
                  {GOAL_HOURS.map((h) => (
                    <div
                      key={h}
                      role="button"
                      onClick={() => onSetGoal(h)}
                      className={`${styles.chip} ${h === goalHours ? styles.chipActive : ""}`}
                    >
                      {h}h
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.fastingControls}>
                <div className={styles.startedAt}>
                  {fast ? `Started at ${timeStr(fast.start)}` : ""}
                </div>
                <div role="button" onClick={onEnd} className={styles.endButton}>
                  End fast
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.sideCol}>
          {/* chart */}
          {history.length > 0 && (
            <div className={styles.chart}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>Recent fasts</div>
                <div className={styles.sectionNote}>hours per session</div>
              </div>
              <div className={styles.chartArea}>
                <div className={styles.goalLine} style={{ bottom: goalLinePx }}>
                  <span className={styles.goalLineLabel}>GOAL</span>
                </div>
                <div className={styles.bars}>
                  {bars.map((b, i) => (
                    <div key={i} className={styles.barCol}>
                      <div className={styles.barValue}>{b.hLabel}</div>
                      <div
                        className={`${styles.bar} ${b.reached ? styles.barReached : ""}`}
                        style={{ height: b.hpx }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.barDays}>
                {bars.map((b, i) => (
                  <div key={i} className={styles.barDay}>
                    {b.day}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* history */}
          <div>
            <div className={styles.historyHeader}>
              <div className={styles.sectionTitle}>History</div>
              {history.length > 0 && (
                <div
                  role="button"
                  onClick={onClear}
                  className={styles.clearButton}
                >
                  Clear
                </div>
              )}
            </div>
            {history.length === 0 ? (
              <div className={styles.empty}>
                No fasts logged yet.
                <br />
                Tap the ring to start your first one.
              </div>
            ) : (
              <div className={styles.historyList}>
                {histItems.map((h, i) => (
                  <div key={i} className={styles.historyItem}>
                    <div
                      className={styles.historyChip}
                      style={{ background: h.chipBg }}
                    >
                      <div
                        className={styles.historyDot}
                        style={{ background: h.color }}
                      />
                    </div>
                    <div className={styles.historyInfo}>
                      <div className={styles.historyDuration}>
                        {h.durationText}
                      </div>
                      <div className={styles.historyRange}>{h.rangeText}</div>
                    </div>
                    <div className={styles.historyMeta}>
                      <div className={styles.historyDate}>{h.dateLabel}</div>
                      <div
                        className={`${styles.historyTag} ${h.met ? styles.tagMet : styles.tagShort}`}
                      >
                        {h.tag}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
