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

## Optional Nomi Connection

The public Atlas works without an account. On the Vercel version, each visitor can optionally connect their own Nomi account to list their Nomis, ask one to fill the form, or send the compact packet directly into chat.

Atlas uses a bring-your-own-key connection:

- The visitor enters their own Nomi account API key.
- The key is retained only in that browser tab using `sessionStorage`.
- It is forwarded to Nomi only for that visitor's requests and is never stored by Atlas.
- Disconnecting or closing the tab forgets the key.
- No account key or shared access password is configured in Vercel.

The Nomi API can return `NoReply` before a slow companion finishes responding. If that happens, copy the eventual JSON reply from the Nomi app into **Nomi answered late?** and Atlas can still fill the form.

## Notes

This is an early beta. The translation is symbolic and runs locally in the browser. The optional per-visitor Nomi connection is the only server-backed feature.

## Deployment

The static experience can still be hosted on GitHub Pages. The optional Nomi connection requires Vercel Functions.

1. Import this repository into Vercel.
2. Deploy. No environment variables are required.
3. Open the site, enter your own Nomi account key, and load your Nomis.

Run `npm test` before deploying to verify the per-visitor key gate, 800-character bound, and Nomi request forwarding.
