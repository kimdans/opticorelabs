#!/usr/bin/env python3
"""OptiCore 15초 브랜드 필름 사운드트랙.

128 BPM, 8마디(= 정확히 15초). 샘플 없이 numpy만으로 합성한다.
타이밍은 showreel.html의 타임라인과 같은 박자 격자(B(bar, beat))를 쓴다.

    python3 make_audio.py out.wav
"""
import sys
import wave

import numpy as np

SR, DUR, BPM = 48000, 15.0, 128
BEAT = 60 / BPM
N, TAIL = int(SR * DUR), SR * 3
rng = np.random.default_rng(7)

# 버스: fx(드럼·효과, 덕킹 없음) / mu(음악, 킥에 맞춰 덕킹) — 각각 dry와 리버브 send
bus = {k: {"dry": np.zeros((2, N + TAIL)), "wet": np.zeros((2, N + TAIL))} for k in ("fx", "mu")}


def B(bar, beat=0.0):
    return (bar * 4 + beat) * BEAT


LOCK = B(1) + 1.5


def tt(d):
    return np.arange(int(SR * d)) / SR


def filt(x, lo=None, hi=None, order=2):
    """Zero-phase Butterworth-shaped filter in the frequency domain."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    H = np.ones_like(f)
    if hi:
        H *= 1 / np.sqrt(1 + (f / hi) ** (2 * order))
    if lo:
        H *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1e-6)) ** (2 * order))
    return np.fft.irfft(X * H, len(x))


def put(sig, t0, gain=1.0, pan=0.0, send=0.0, to="fx"):
    """Mix a mono (n,) or stereo (2, n) signal into a bus at time t0."""
    sig = np.asarray(sig)
    if sig.ndim == 1:
        th = (pan + 1) * np.pi / 4
        sig = np.stack([sig * np.cos(th) * 1.414, sig * np.sin(th) * 1.414])
    i = int(round(t0 * SR))
    if i < 0:
        sig, i = sig[:, -i:], 0
    n = min(sig.shape[1], N + TAIL - i)
    if n <= 0:
        return
    bus[to]["dry"][:, i:i + n] += sig[:, :n] * gain
    if send:
        bus[to]["wet"][:, i:i + n] += sig[:, :n] * gain * send


# ---------- instruments ----------
def kick(g=1.0):
    t = tt(.4)
    f = 50 + 135 * np.exp(-t / .03)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .12)
    s += filt(rng.standard_normal(len(t)), lo=2000) * np.exp(-t / .003) * .25
    return np.tanh(s * 1.6) * g


def boom():
    t = tt(1.8)
    f = 46 + 74 * np.exp(-t / .08)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / .38) + .35 * np.sin(2 * ph) * np.exp(-t / .2)   # 2배음: 작은 스피커에서도 들리게
    return np.tanh(body * 1.7) * .8


def hat(open_=False):
    t = tt(.28 if open_ else .06)
    return filt(rng.standard_normal(len(t)), lo=7000, order=3) * np.exp(-t / (.075 if open_ else .014))


def clap():
    t = tt(.22)
    n = filt(rng.standard_normal(len(t)), lo=1100, hi=8000)
    e = sum(np.where(t >= d, np.exp(-(t - d) / tau), 0) for d, tau in [(0, .006), (.011, .006), (.023, .05)])
    return n * e


def shutter():
    t = tt(.32)
    n = rng.standard_normal(len(t))
    e = sum(np.where(t >= d, np.exp(-(t - d) / tau) * g, 0) for d, tau, g in [(0, .004, 1), (.018, .003, .6), (.062, .007, .9), (.085, .004, .5)])
    return filt(n * e, lo=900, hi=7000) + np.sin(2 * np.pi * 140 * t) * np.exp(-t / .02) * .6


def pluck(f, d=.9, bright=1.0):
    t = tt(d)
    s = np.zeros(len(t))
    for k in range(1, 13):
        if f * k > 15000:
            break
        s += np.sin(2 * np.pi * f * k * t * (1 + 0.0004 * k * k)) * np.exp(-t * (2.2 + 1.6 * k) / bright) / k
    return s * np.minimum(1, t / .003)


def bell(f, d=2.6):
    t = tt(d)
    idx = 3.2 * np.exp(-t / .35)
    return np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * 3.51 * t)) * np.exp(-t / .8) * np.minimum(1, t / .002)


def tick(f=2400.0):
    t = tt(.03)
    return (np.sin(2 * np.pi * f * t) + .4 * rng.standard_normal(len(t))) * np.exp(-t / .004)


def beep(f, d=.07):
    t = tt(d)
    return np.sin(2 * np.pi * f * t) * np.minimum(1, t / .004) * np.minimum(1, (d - t) / .01)


def saw(f, t, nh=16):
    s = np.zeros(len(t))
    for k in range(1, nh + 1):
        if f * k > 12000:
            break
        s += np.sin(2 * np.pi * f * k * t) / k
    return s


def pad(freqs, d, att=.4, rel=.8, cut=1800):
    t = tt(d)
    out = np.zeros((2, len(t)))
    for f in freqs:
        for det, ch in [(-.004, 0), (.004, 1), (.0015, 0), (-.0015, 1)]:
            out[ch] += saw(f * (1 + det), t + rng.random() * .01, 14)
    env = np.minimum(1, t / att) * np.minimum(1, np.maximum(0, d - t) / rel)
    return np.stack([filt(out[0], hi=cut), filt(out[1], hi=cut)]) * env / len(freqs)


def bass(f, d=.21):
    t = tt(d)
    s = saw(f, t, 16) + .6 * np.sin(2 * np.pi * f * t)
    return filt(s, hi=480) * np.minimum(1, t / .004) * np.exp(-t / .12)


def sweep(d, f0, f1):
    """Noise whoosh whose centre frequency glides f0 → f1 (crossfaded band stack)."""
    t = tt(d)
    n = rng.standard_normal(len(t))
    out = np.zeros(len(t))
    K = 8
    for k in range(K):
        fc = f0 * (f1 / f0) ** (k / (K - 1))
        out += filt(n, lo=fc * .7, hi=fc * 1.4) * np.exp(-((t / d - k / (K - 1)) ** 2) / (2 * .14 ** 2))
    return out


def drone(d):
    t = tt(d)
    left = saw(73.42, t, 12) + saw(77.78 * 1.003, t, 12) + .5 * saw(110 * .99, t, 8)
    right = saw(73.42 * 1.004, t, 12) + saw(77.78, t, 12) + .5 * saw(116.54, t, 8)
    return np.stack([filt(left, hi=420), filt(right, hi=420)]) * (.6 + .4 * np.sin(2 * np.pi * .9 * t))


def static(d):
    t = tt(d)
    n = filt(rng.standard_normal(len(t)), lo=1200, hi=7000)
    g = np.zeros(len(t))
    step = BEAT / 4
    for k in range(int(d / step) + 1):
        if rng.random() < .7:
            a, b = int(k * step * SR), int((k + rng.uniform(.2, .9)) * step * SR)
            g[a:b] = rng.uniform(.2, 1)
    crack = (rng.random(len(t)) > .9993) * rng.uniform(-1, 1, len(t)) * 6
    return n * filt(g, hi=300) + filt(crack, lo=2000)


NOTE = {"B1": 61.74, "G1": 49.0, "A1": 55.0, "D2": 73.42, "D3": 146.83, "A3": 220.0, "D4": 293.66, "E4": 329.63, "F#4": 369.99,
        "G4": 392.0, "A4": 440.0, "B4": 493.88, "D5": 587.33, "E5": 659.25, "F#5": 739.99, "G5": 783.99, "A5": 880.0, "B5": 987.77,
        "D6": 1174.66, "E6": 1318.51, "F#6": 1479.98, "A6": 1760.0, "D7": 2349.32}
kicks = []


def K(t, g=.85):
    kicks.append((t, g))
    put(kick(g), t)


# ---------- bars 1–2 · NOISE ----------
d = B(2)
t = tt(d)
put(drone(d) * np.minimum(1, t / 1.0) * np.clip((3.62 - t) / .2, 0, 1), 0, .2, send=.3, to="mu")
st = static(3.45)
put(st * (.35 + .65 * tt(3.45) / 3.45), 0, .085)
for k in range(14):                                             # 토큰이 나타날 때마다 틱
    put(tick(1800 + rng.uniform(-400, 1400)), .04 + k * .095, .15, pan=rng.uniform(-.8, .8), send=.35)
for b in (1, 2, 3):                                             # 1마디의 끊기는 컷
    put(kick(.55), B(0, b))
    put(filt(rng.standard_normal(2400), lo=3000) * np.exp(-tt(.05) / .012), B(0, b), .2, send=.2)
t = tt(1.5)                                                      # 초점 찾는 서보 소리
servo = np.sin(2 * np.pi * np.cumsum(330 + 190 * np.sin(2 * np.pi * 1.28 * t - np.pi / 2)) / SR)
put(filt(servo, hi=1500) * np.minimum(1, t / .1) * np.minimum(1, (1.5 - t) / .05), B(1), .045, send=.3)
t = tt(1.6)                                                      # 라이저
put(sweep(1.6, 400, 9000) * (t / 1.6) ** 2.5, B(1), .26, send=.25)
put(np.sin(2 * np.pi * np.cumsum(110 * 4 ** (t / 1.6)) / SR) * (t / 1.6) ** 2, B(1), .07, send=.3)
put(beep(2637.0), LOCK, .2, send=.25)                           # AF 확인음 "삐빅"
put(beep(2637.0), LOCK + .09, .2, send=.25)
t = tt(.26)                                                      # 드롭 직전의 빨려 들어가는 소리
put(filt(rng.standard_normal(len(t)), lo=2500) * (t / .26) ** 4, B(2) - .26, .22)

# ---------- bar 3 · FOCUS ----------
put(shutter(), B(2) - .004, .7, send=.4)
put(boom(), B(2), .95)
kicks.append((B(2), 1.0))
put(pad([NOTE[n] for n in ("D3", "A3", "D4", "E4", "F#4")], B(3) - B(2) + .1, att=.06, rel=.35, cut=2200), B(2), .34, send=.5, to="mu")
for k, n in enumerate(("D5", "E5", "F#5", "A5", "B5", "D6", "E6", "F#6", "A6", "D7")):   # 둘째 줄 글자가 올라올 때의 반짝임
    put(pluck(NOTE[n], .7, 1.3), B(2, 1) - .02 + k * .03, .15, pan=(-1) ** k * .5, send=.6, to="mu")
K(B(2, 2), .5)
K(B(2, 3), .6)
for e in range(2, 8):
    put(hat(), B(2) + e * BEAT / 2, .07 + .01 * e)
t = tt(.36)
put(sweep(.36, 300, 6000) * np.sin(np.pi * t / .36) ** 2, B(3) - .3, .2, send=.2)

# ---------- bars 4–6 · LENS / STATE / CORE ----------
roots = {3: ["D2"] * 8, 4: ["B1"] * 8, 5: ["G1"] * 4 + ["A1"] * 4}
leads = {3: ("D5", "F#5", "A5", "D6"), 4: ("B4", "D5", "F#5", "B5")}
for bar in (3, 4, 5):
    for beat in range(4):
        K(B(bar, beat))
        put(hat(True), B(bar, beat + .5), .13, pan=.2)
        for s in range(4):
            put(hat(), B(bar, beat + s / 4), .045 if s % 2 == 0 else .03, pan=-.2)
        if beat in (1, 3):
            put(clap(), B(bar, beat), .22, send=.35)
        if bar in leads:
            f = NOTE[leads[bar][beat]]
            put(pluck(f, 1.0, 1.2) + .5 * pluck(f / 2, 1.0), B(bar, beat), .34, pan=.15 * (beat - 1.5), send=.5, to="mu")
            put(tick(3000), B(bar, beat), .1, pan=.4)
    for e in range(8):
        put(bass(NOTE[roots[bar][e]]), B(bar) + e * BEAT / 2, .2 if e % 2 == 0 else .34, to="mu")
for bar in (4, 5):                                               # 장면 전환 휩 팬
    t = tt(.34)
    put(sweep(.34, 500, 5200) * np.sin(np.pi * t / .34) ** 2, B(bar) - .24, .2, send=.2)
for beat in (1, 2, 3):                                           # STATE 장면의 가로 이동
    t = tt(.3)
    put(sweep(.3, 900, 3600) * np.sin(np.pi * t / .3) ** 2, B(4, beat) - .27, .09, pan=-.3)
E5 = [B(5) + b * BEAT for b in (0, .5, 1, 1.5, 2, 2.5, 2.75, 3)]  # 토큰 8개가 제자리에 놓이는 순간
for k, (te, n) in enumerate(zip(E5, ("G4", "A4", "B4", "D5", "E5", "G5", "A5", "B5"))):
    put(pluck(NOTE[n], .8, 1.25), te, .32, pan=-.5 + k / 7, send=.5, to="mu")
    put(tick(2600 + 150 * k), te + .04, .12)
t = tt(1.2)
put(sweep(1.2, 600, 12000) * (t / 1.2) ** 2, B(6) - 1.2, .26, send=.25)
for s in range(8):                                               # 마지막 두 박의 스네어 롤
    put(clap(), B(5, 2) + s * BEAT / 4, .05 + .028 * s, send=.3)
t = tt(.33)
put(filt(rng.standard_normal(len(t)), lo=3000) * (t / .33) ** 3, B(6) - .33, .3)

# ---------- bars 7–8 · OPTICORE ----------
put(boom(), B(6), 1.0)
kicks.append((B(6), 1.0))
t = tt(1.9)
put(filt(rng.standard_normal(len(t)), lo=4000) * np.exp(-t / .55), B(6), .2, send=.5)
put(pad([NOTE[n] for n in ("D2", "D3", "A3", "D4", "F#4", "A4", "E5")], DUR - B(6) + .2, att=.03, rel=1.7, cut=2600), B(6), .38, send=.5, to="mu")
put(bell(NOTE["D6"]), B(6), .24, pan=-.2, send=.7, to="mu")
put(bell(NOTE["A5"]), B(6, 1), .16, pan=.3, send=.7, to="mu")
for k, n in enumerate(("D5", "E5", "F#5", "A5", "B5", "D6", "E6", "F#6")):                 # 워드마크 여덟 글자
    put(pluck(NOTE[n], .5, 1.2), B(6, 1) + .08 + k * .035, .1, pan=-.4 + k * .1, send=.6, to="mu")
K(B(7), .45)
put(bell(NOTE["F#5"]), B(7), .18, pan=-.25, send=.7, to="mu")
put(bell(NOTE["A5"]), B(7) + .02, .13, pan=.25, send=.7, to="mu")
put(bell(NOTE["D5"]), B(7, 1), .13, send=.7, to="mu")
put(boom(), B(7, 2), .45)
kicks.append((B(7, 2), .6))
put(bell(NOTE["D6"]), B(7, 2), .2, send=.7, to="mu")

# ---------- mix ----------
tn = np.arange(N + TAIL) / SR
duck = np.ones(N + TAIL)
for tk, g in kicks:
    duck *= 1 - .5 * g * np.where(tn >= tk, np.exp(-(tn - tk) / .11), 0)
for part in ("dry", "wet"):
    bus["mu"][part] *= duck

ir_t = tt(2.4)
ir = np.stack([filt(rng.standard_normal(len(ir_t)), lo=250, hi=6500) * np.exp(-ir_t / .55) for _ in range(2)])
ir[:, :int(.012 * SR)] = 0
ir /= np.sqrt((ir ** 2).sum(axis=1, keepdims=True))
wet = bus["fx"]["wet"] + bus["mu"]["wet"]
L = N + TAIL + ir.shape[1]
rev = np.stack([np.fft.irfft(np.fft.rfft(wet[c], L) * np.fft.rfft(ir[c], L), L)[:N + TAIL] for c in range(2)])

mix = (bus["fx"]["dry"] + bus["mu"]["dry"] + rev * .5)[:, :N]
mix = np.stack([filt(mix[0], lo=36, order=3), filt(mix[1], lo=36, order=3)])
mix = np.tanh(mix * .9)
mix *= .62 / np.abs(mix).max()                                       # 약 -14 LUFS
t = np.arange(N) / SR
mix *= np.clip((DUR - t) / .45, 0, 1) ** 1.5 * np.minimum(1, t / .01)   # 끝을 조용히 닫아 반복 재생이 매끄럽게

out = sys.argv[1] if len(sys.argv) > 1 else "showreel-audio.wav"
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix.T * 32767).astype("<i2").tobytes())

for name, a, b in [("noise", 0, B(2)), ("focus", B(2), B(3)), ("groove", B(3), B(6)), ("logo", B(6), DUR)]:
    seg = mix[:, int(a * SR):int(b * SR)]
    print(f"{name:7s} rms {20 * np.log10(np.sqrt((seg ** 2).mean()) + 1e-9):6.1f} dBFS  peak {20 * np.log10(np.abs(seg).max() + 1e-9):6.1f} dBFS")
print("wrote", out)
