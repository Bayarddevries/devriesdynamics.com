---
title: "I turned a 2017 tablet into a family smart screen"
date: 2026-10-17
kicker: "Weekend Project · 01"
tags: [old hardware, repurpose]
read: "6 min read"
---

We had an old Huawei tablet sitting in a drawer. Android 7, 1.9 GB of RAM, maybe a gig of free space after the bloat. Not worth anything to sell, too slow to be useful as a tablet. But it was a perfectly good screen, still turns on, and feels like a complete waste to give up on. So for this weekend's project we are going to bring this thing back to life and find a way to make it useful again.

One thing I've been looking to get for a while is a new smart screen. I've got this old tablet and I'm not willing to give Google or Amazon any more of my money, so this sounds like a good fit.

## The problem with old Android

Old Android tablets like this are slow for one reason: the manufacturer loaded them with junk. This one had 30 packages of preinstalled garbage eating RAM and CPU. You can't root it, but you don't need to. You can debloat it with `adb` and a list of package names.

```bash
adb connect 10.0.0.81:5555
adb shell pm list packages | grep -i huawei
adb shell pm disable-user --user 0 com.huawei.something
```

Stripped all the junk, and suddenly a 1.9 GB tablet has room to breathe. It's not a new tablet, and it's not going to replace anything you've bought in the last 5 years, but it's now running smoother and can display a webpage in Chrome, which is all we are going to need.

## One page, not an app

The trick is that the tablet doesn't run a heavy app. It runs a single thin web page in fullscreen Chrome, and a small server on my PC feeds it data. The tablet just renders what the server sends, so it all lives in my home.

- **Calendar** — Google Calendar, read-only
- **Reminders** — Google Tasks
- **Weather** — Open-Meteo, free, no key
- **Photos** — a shared album, no API needed

Everything is free. No subscriptions, no cloud service, no monthly fee. Just a tablet that was going in the trash and a web interface being served from the PC in the office.

## Why this matters

Most people don't need a new device. They need the ones they have to stop being annoying. Narrow the use of these devices to something simple, like display my family's calendar and to-do list, and you might be blown away at how capable that old tablet you have in your closet might be. That's the whole philosophy behind this business, and how I want to help people.

**Next weekend:** We find a way to breathe new life into a Pixel 2 that has been sitting in a drawer for 4 years.

If you've got an old device that's more trouble than it's worth, let's bring it back to life. [devriesdynamics.com](https://devriesdynamics.com)
