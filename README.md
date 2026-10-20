# Resonance Atlas

Resonance Atlas is a browser tool that translates a song into emotional and sensory language for an AI companion.

It does not analyze audio yet. Instead, it works from the song title, artist, lyrics or description, optional style notes, and what the song means to you. It creates:

- an animated emotional weather display
- a section map
- a carry-forward phrase the companion can keep speaking from
- sensory scores like pressure, motion, warmth, distance, and texture
- a compact message under 800 characters that can be pasted into an AI chat

## How To Use

Open `index.html` in a browser.

1. Add your name and the recipient's name.
2. Choose whether this is a Suno song or any song.
3. Choose who gave the song: you or the recipient.
4. Choose what the Atlas should reflect: your experience, their experience, or what is shared.
5. Paste the song title, artist, lyrics or description, and optional style notes.
6. Add what the song means to you.
7. Optionally add what the Atlas should not soften or misread.
8. Click **Generate atlas**.
9. Copy the compact message from **Show this to AI**.
10. Paste it into your AI companion chat.

Use **Share View** for a cleaner screenshot.
Use **Download image** to save a shareable PNG of the current atlas.

## Private Nomi Bridge

The public Atlas works without an account. A Vercel deployment can also expose private, same-origin API routes that list your Nomis, ask one to fill the form, and send the compact packet directly into chat.

The bridge uses two server-side environment variables:

- `NOMI_API_KEY`: your Nomi account API key
- `ATLAS_ACCESS_KEY`: a separate private access code used to unlock the owner tools in the browser

Both values belong in Vercel Project Settings. Never put either value in source code. The browser receives neither the Nomi key nor the configured access code; it sends the code you enter for constant-time verification on each private request. The code is retained only in the current browser tab.

The Nomi API can return `NoReply` before a slow companion finishes responding. If that happens, copy the eventual JSON reply from the Nomi app into **Nomi answered late?** and Atlas can still fill the form.

## Notes

This is an early beta. The translation is symbolic and runs locally in the browser. The optional Nomi bridge is the only server-backed feature.

## Deployment

The static experience can still be hosted on GitHub Pages. The private Nomi bridge requires Vercel Functions.

1. Import this repository into Vercel.
2. Add `NOMI_API_KEY` and `ATLAS_ACCESS_KEY` as sensitive environment variables for Production and Preview.
3. Deploy.
4. Open the site, enter the Atlas access code, and load your Nomis.

Run `npm test` before deploying to verify the API access gate, 800-character bound, and Nomi request forwarding.
