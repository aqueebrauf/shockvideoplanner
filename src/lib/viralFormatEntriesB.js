import { yt } from './viralFormatYoutube';

const side = (hookCopy, hookDescription, videoCopy, videoDescription, notes) => ({
  hookCopy,
  hookDescription,
  videoCopy,
  videoDescription,
  notes,
});

const GEORGE = yt('7yLgHeYeQAE', '0:00');

export const viralFormatEntriesB = [
  {
    appName: 'Flamme',
    formatName: 'Count the download, not the view',
    founder: 'An Nayal',
    showName: 'Superwall',
    priority: false,
    links: [
      { id: 'yt', label: 'Superwall — jump to 33:19', url: yt('pb4JIH8FubE', '33:19') },
    ],
    original: side(
      'The hook is whatever format you are actually measuring.',
      'An compares formats by conversion, not by views. The opening depends on which bucket you are testing.',
      'Meme slideshow, or hook plus reaction plus app, or the product demo as the subject.',
      'Approximate pattern he gives: meme/slideshow about 0.05–0.2% view to download, hook plus reaction plus app about 0.3–0.5%, product demo as the main subject about 0.5–1%. Huge meme views barely converted.',
      'Tag Smash videos by format, then watch views, profile visits, site visits, and signups. A 200K demo can beat a 4M entertainment Reel.'
    ),
    smash: side(
      'Same goal. Three different openings. Only one is allowed to stay.',
      'Shoot the meme version, the reaction version, and the demo-as-subject version of one Smash job.',
      'The winner is the one that reaches signups, not the one that reaches a million views.',
      'Put the format name in the caption or a tracker: meme, reaction, demo. Read the path after the view.',
      'Use this as the scoreboard for the rest of the library. Do not let a pretty view count pick the format.'
    ),
  },
  {
    appName: 'Bro',
    formatName: 'One charged moment',
    founder: 'Roger Chen',
    showName: 'Superwall',
    priority: false,
    links: [
      { id: 'yt', label: 'Superwall — jump to 12:04', url: '' },
    ],
    original: side(
      'She is not replying. What do I say?',
      'One texting problem, emotionally specific. Not "AI dating assistant."',
      'Awkward message. Bro suggests the line. The result is the send.',
      'The category gets narrowed to one moment. They validated with a clickable mock-up before the product. One mock-up video reportedly reached about 7.9M views.',
      'Paste the episode URL when you have it. The mock-up lesson matters as much as the texting niche.'
    ),
    smash: side(
      'It has been 11 days and I have not studied once.',
      'One sentence a real person would text a friend. Not "goal tracking."',
      'Smash: do not restart the six-month plan. Here is the next 40 minutes.',
      'Name the moment, show the bad state, show the one Smash response. A Figma screen is allowed if the feature is not built.',
      'The magic is the narrow moment. If the line could apply to any ambition, rewrite it.'
    ),
  },
  {
    appName: 'GoTall',
    formatName: 'Their comment is the next video',
    founder: 'Michael Que',
    showName: 'Starter Story',
    priority: false,
    links: [
      {
        id: 'story',
        label: 'Starter Story — jump to ~5:29',
        url: 'https://www.starterstory.com/stories/i-can-t-believe-this-app-makes-100k-month',
      },
    ],
    original: side(
      'Dad 5\'11. Mom 5\'4. Me 5\'8. How tall will I be?',
      'The video is a reply to a comment. The inputs are someone else\'s numbers.',
      'Enter the numbers in GoTall. Reveal the result. The comments fill with people asking for theirs.',
      'Comments write the next video. He replicated it across more accounts and creators. The pipeline renews itself.',
      'A sharable personal result is the format. The app is the calculator.'
    ),
    smash: side(
      'I am at 62% of the JEE syllabus with 90 days left. Am I cooked?',
      'Reply-video framing. Read their comment out loud before any screen.',
      'Smash plan: you can cover the hole if these three chapters move. The rest can wait.',
      'Comment, personalised Smash verdict, more comments. Running version: "12 km max. Can I do a half in 8 weeks?"',
      'This is a content machine, not a one-off. Save the comments that are specific enough to film.'
    ),
  },
  {
    appName: 'Copia',
    formatName: 'If you are seeing this before the date',
    founder: 'Phoenix Do',
    showName: 'Superwall',
    priority: false,
    links: [
      { id: 'yt', label: 'Superwall — viral-format section near the start', url: '' },
    ],
    original: side(
      'If you are seeing this before May 7th…',
      'The date does the targeting. People who are not in that window can scroll. People who are will stay.',
      'Repeat these affirmations. Show them inside Copia. "These are the affirmations from Copia." The mention is casual on purpose.',
      'Time-sensitive hook, useful ritual, quick demo, soft app mention. People ask "what is Copia?" in the comments. A co-founder version reportedly reached about 10M views.',
      'The crash-out slideshow is a second Copia format and has its own card. Do not mix them in one edit.'
    ),
    smash: side(
      'If you are seeing this with 100 days left for JEE…',
      'A deadline the viewer can check against their own life. January 1, exam form, race day, Monday.',
      'Here are the three things for this week. They are already in Smash. That is the whole plan.',
      'Date hook, useful micro-plan, Smash shown as the place those lines live, no hard sell. Let the comments ask what Smash is.',
      'Timely hooks age out. That is a feature. Shoot a new date instead of trying to make one video evergreen.'
    ),
  },
  {
    appName: 'Copia',
    formatName: 'Two-frame crash-out',
    founder: 'Phoenix Do',
    showName: 'Superwall',
    priority: false,
    links: [
      { id: 'yt', label: 'Superwall — same Phoenix Do episode, crash-out slideshow', url: '' },
    ],
    original: side(
      'A current meme, in two frames. Almost no explanation.',
      'Phoenix describes a ridiculously simple two-frame slideshow tied to a cultural meme.',
      'Frame one sets the crash-out. Frame two is the punchline. The app mention can be tiny.',
      'It reached eight figures of views. The format is the slideshow, not the affirmation ritual on the other Copia card.',
      'Use whatever meme is alive this week. The structure stays at two frames.'
    ),
    smash: side(
      'Me making a six-month plan. Me on day three.',
      'Two images. The joke has to land if you mute it and cover the logo.',
      'Caption: Smash is for the day-three version.',
      'Keep it to two frames. If you need a demo, this is the wrong card. Use the date-hook card instead.',
      'Fast to produce. Only worth repeating when the meme is actually current.'
    ),
  },
  {
    appName: 'Jenni AI',
    formatName: 'Steal the creator, not the niche',
    founder: 'Matthew Gittleson',
    showName: 'Superwall',
    priority: false,
    links: [
      { id: 'yt', label: 'Superwall — jump to ~11:00, UGC formats', url: '' },
    ],
    original: side(
      'Whatever first frame that creator already wins with.',
      'He looks for camera charisma in beauty, lifestyle, or study, then steals the mechanic rather than the topic.',
      'The format moves to AI or student content. The performance stays.',
      'Judge the first frame, emotional expressiveness, and whether they can tell a story. Their creator operation has done tens of millions of views. Start with the TikTok format, then build a feature that fits it.',
      'This is a casting and research format more than a single shot list.'
    ),
    smash: side(
      'Find a study or running creator whose first frame already stops you. Rebuild that mechanic around one Smash moment.',
      'Do not hire a generic productivity face. Hire the charisma, then change the subject.',
      'The borrowed format ends on a Smash output: a score, a today list, a verdict.',
      'Write down the original mechanic in one sentence before the shoot. If you cannot, you are copying the topic instead of the format.',
      'Some future Smash features should be chosen because they fit a format, not the other way around.'
    ),
  },
  {
    appName: 'Jungle',
    formatName: 'I randomly found this',
    founder: 'Julian Alvarez',
    showName: 'Superwall',
    priority: false,
    links: [
      { id: 'yt', label: 'Superwall — jump to ~3:37', url: '' },
    ],
    original: side(
      'Guys, I randomly found this and it is actually insane for studying.',
      'The creator acts like a student who just discovered a tool. Not "Jungle sponsored me."',
      'Upload study material. Show it generating the notes. Share it like alpha.',
      'Discovery framing at scale: dozens of creators, hundreds of videos a week. The product is gossip, not an integration.',
      'Best when the account already sounds like a student, runner, or someone in the middle of a goal.'
    ),
    smash: side(
      'I found this thing that tells you if you are actually behind.',
      'Casual, slightly rushed, like they are sending it to a friend. No founder voice.',
      'I put my exam date in. It said I am lying to myself about Physics.',
      'Stumble across Smash, show one output, go back to the day. Do not teach the app.',
      'If it sounds like an ad read, reshoot the first line.'
    ),
  },
  {
    appName: 'Symmetry',
    formatName: 'Two notifications',
    founder: 'Mauro Botanes',
    showName: 'Starter Story',
    priority: false,
    links: [
      { id: 'yt', label: 'Starter Story — jump to ~4:41', url: '' },
      { id: 'ig', label: 'Instagram @symmetryclub', url: 'https://www.instagram.com/symmetryclub/' },
    ],
    original: side(
      'Your girlfriend is leaving you.',
      'An iPhone lock screen. The top notification is the emotional problem.',
      'Under it: Symmetry says go to the gym and work out. That is the whole video.',
      'One version reportedly reached about 17M views. They tracked tens of thousands of videos across hundreds of accounts and sorted them into formats and subformats.',
      'Tiny, stealable, and easy to vary. The notification is the script.'
    ),
    smash: side(
      'Exam results came out.',
      'Lock screen. One painful notification on top.',
      'Smash: you showed up 83 of the last 90 days. Or: today\'s workout is still waiting.',
      'Two notifications, no face, no demo. Swap the top line every time. The Smash line stays short enough to read on a lock screen.',
      'Direct test. If it needs a third notification, it is too long.'
    ),
  },
  {
    appName: 'Praktika',
    formatName: 'The coach interrupts',
    founder: 'Adam Turaev',
    showName: 'Sub Club / RevenueCat',
    priority: false,
    links: [
      { id: 'pod', label: 'Sub Club — creator-video section', url: '' },
    ],
    original: side(
      'A normal English conversation. Then the coach cuts in.',
      'The creator barely sells Praktika. Adam disliked the video because it did not showcase the app enough, and let it post anyway.',
      'Mistake, correction, conversation continues. The interruption is the product.',
      'Reportedly about 10M views each on Instagram, TikTok, and YouTube. They copied the correction structure with creators in other countries.',
      'No traditional demo. The coach moment is the entertainment.'
    ),
    smash: side(
      'I skipped because I was tired.',
      'Someone talks to camera like they are explaining their week. Smash cuts in.',
      'Smash: you said tired on Tuesday too. Today is 20 minutes, then you can be tired.',
      'The coach line interrupts the excuse. Creator reacts. Conversation continues. Do not add a feature tour after.',
      'Write interruption lines the way Praktika wrote corrections: specific, a little rude, obviously from the product.'
    ),
  },
  {
    appName: 'Cal AI',
    formatName: 'Invisible inside the day',
    founder: 'Jake Castillo / Cal AI team',
    showName: 'Superwall — Alfie Dickens on the creator machine',
    priority: false,
    links: [
      { id: 'yt', label: 'Superwall — Cal AI marketing', url: yt('l0vswWcGmMs', '0:00') },
    ],
    original: side(
      'What I eat in a day. No mention of an app.',
      'Breakfast shows up inside a day-in-the-life the creator already makes.',
      'They scan the food. Calories appear. The day continues. No explanation.',
      'Do not make a Cal AI video. Put the product inside content that already has an audience. The scan is an invisible ad.',
      'The linked episode is Alfie Dickens on Superwall about the Cal AI creator machine. The day-in-the-life scan is the format to steal.'
    ),
    smash: side(
      'Day in my life training for a half marathon.',
      'Run, breakfast, work. Smash is not announced.',
      'A two-second check-in. Life continues.',
      'The video still works if someone misses the check-in. That is the point. Smash is a behaviour inside the day, not the plot.',
      'One of the most important formats in this library for creator accounts.'
    ),
  },
  {
    appName: 'Ladder',
    formatName: 'Cut the footage they already have',
    founder: 'Greg Stewart',
    showName: 'Sub Club by RevenueCat',
    priority: false,
    links: [
      { id: 'pod', label: 'Sub Club — TikTok section around 37:51', url: '' },
    ],
    original: side(
      'A coach\'s raw workout clip, not a promo shoot.',
      'They took footage already on a phone and cut it into TikTok-native clips. The coach had almost no TikTok experience.',
      'Useful or entertaining training clips. Ladder ran the account.',
      'Reportedly about 250K followers in about 45 days, with million-plus-view outcomes weekly. They did not shoot polished ads.',
      'If you work with a runner or a JEE creator, do not ask them to invent Smash ads. Use the footage of the real journey.'
    ),
    smash: side(
      'This was already on her phone from Tuesday\'s long run.',
      'No new shoot. Cut existing training or study footage into a standalone clip.',
      'End card, or a caption: the week lives in Smash.',
      'The story is their goal. Smash is the label on footage they were going to have anyway.',
      'Ask creators for camera-roll dumps before you ask them to perform.'
    ),
  },
  {
    appName: 'MonAI',
    formatName: 'The journey is the show',
    founder: 'Florian Vates',
    showName: 'Starter Story',
    priority: false,
    links: [
      { id: 'yt', label: 'Starter Story — 6:58, influencer examples', url: '' },
    ],
    original: side(
      'We got invited to Apple. That is the story.',
      'Story, then circumstance, then the app. Not hook, demo, CTA. The first winner was a simple walkthrough. Later videos got more narrative.',
      'MonAI exists inside the WWDC story. It is not the title.',
      'That video reportedly reached about 1.7M views and added nearly $5K MRR. They intentionally make only about three higher-quality story videos a month.',
      'Fewer videos, more story. Opposite of a daily slideshow account.'
    ),
    smash: side(
      'I said I would run a half this year. This is week 9, and I almost quit.',
      'The creator\'s real goal is the episode. Smash is a device in the story: the week it said they were behind, the day it gave them one session.',
      'Smash shows up when the story needs it, then the week continues.',
      'Three story Reels a month, not thirty thin ones. The app moves the plot.',
      'Use this for founder or flagship creator films. Do not use it for the daily testing account.'
    ),
  },
  {
    appName: 'NGL',
    formatName: 'The notification is the hook',
    founder: 'Hunter Isaacson',
    showName: 'Superwall',
    priority: false,
    links: [
      { id: 'yt', label: 'Superwall — Hunter Isaacson', url: yt('DTree0unT_0', '0:00') },
    ],
    original: side(
      'I was with your boyfriend last night.',
      'The craziest anonymous message, not the product. Shock first.',
      'Open NGL. Try to work out who sent it. The reaction is the payoff.',
      'The emotional notification creates the situation. NGL only explains why it exists.',
      'A notification-led format. The app is the second beat.'
    ),
    smash: side(
      'You are now 17 days behind your goal.',
      'Full-screen notification. The creator says "what?" before we know the app.',
      'Open Smash. The screen shows how the 17 days happened.',
      'Emotional Smash event, reaction, then the explanation. The notification has to be specific enough to hurt.',
      'Pairs with the Symmetry lock-screen card, but this one needs a face and a second act.'
    ),
  },
  {
    appName: 'DaGame',
    formatName: 'Day X, and the comments built it',
    founder: 'Rafael Kramer',
    showName: 'Superwall',
    priority: false,
    links: [
      { id: 'yt', label: 'Superwall — Rafael Kramer, DaGame', url: '' },
    ],
    original: side(
      'Day 4 of making a DaBaby game.',
      'An ongoing build series. Today\'s change is the video.',
      'Take yesterday\'s most ridiculous comment and put it in the build. Ask what to add tomorrow.',
      'One video reportedly reached about 4M views. Early videos drove hundreds of thousands of downloads. The comments write the next episode.',
      'A founder-account format. The product changing in public is the content.'
    ),
    smash: side(
      'Day 18 of building Smash. Yesterday you said milestones suck.',
      'Show the old screen, then the change you made because of a comment.',
      'So I rebuilt them. Tell me if this version is worse.',
      'Series title stays stable. Each episode implements one comment. End by asking for the next change.',
      'Good for the founder account. Bad if you fake the "we rebuilt it" and nothing shipped.'
    ),
  },
  {
    appName: 'Coherence',
    formatName: 'Prove the problem before the feature',
    founder: 'Jack & Nick Sweeney',
    showName: 'Starter Story',
    priority: false,
    links: [
      { id: 'yt', label: 'Starter Story — 8:30, content example', url: '' },
    ],
    original: side(
      'Do you want to know something they don\'t want you to know?',
      'A polarizing or mysterious knowledge hook. The product is not in the first line.',
      'Explain the Vortex Breath. Demonstrate it. Coherence is where you practise it.',
      'X post, then a short if it hits, then long-form, then a product around what won. They describe it as reverse-engineering the product from content.',
      'Test the goal problem as a Reel before building the paid plan.'
    ),
    smash: side(
      'Nobody tells you what to do on day 12 when you have already skipped.',
      'Teach the problem in a way that would be useful with Smash deleted.',
      'If that video gets saves, the Smash screen for that problem is the feature to build.',
      '50 goal problems as Reels. The ones that travel become plans. The ones that die do not become roadmap items.',
      'Content is the research. The feature is the sequel.'
    ),
  },
  {
    appName: 'Wrestle AI',
    formatName: 'Stitch the expert',
    founder: 'George Lampropoulos',
    showName: 'Superwall',
    priority: false,
    links: [
      { id: 'yt', label: 'Superwall — George Lampropoulos', url: GEORGE },
    ],
    original: side(
      'Your coach would pause the tape right here.',
      'Stitch a real coach video where they call out a move.',
      'Instead of needing your coach to do this… Wrestle AI does it.',
      'Format one of two. Clarity beats the biggest view count: people should understand the product in about the first 15 seconds.',
      'The expert supplies authority. The app supplies the shortcut. Same episode as AbMax and Brawler.'
    ),
    smash: side(
      'You need to review your training every week.',
      'Stitch a coach, teacher, or senior who gives the advice straight.',
      'Or Smash just does this. Weekly check-in opens.',
      'Expert line, then Smash performing that job. Keep the product understandable before 15 seconds.',
      'Do not stitch random viral clips. Stitch someone the goal audience already trusts.'
    ),
  },
  {
    appName: 'Wrestle AI',
    formatName: 'Upload it, get the mistake',
    founder: 'George Lampropoulos',
    showName: 'Superwall',
    priority: false,
    links: [
      { id: 'yt', label: 'Superwall — same George episode, match-upload format', url: GEORGE },
    ],
    original: side(
      'I uploaded the match.',
      'The footage of the real performance is the hook. No skit.',
      'The AI immediately says what they did wrong.',
      'Format two. The diagnosis is the payoff. Viewers should still understand the product quickly.',
      'Separate from the stitch format. This one is upload, then verdict.'
    ),
    smash: side(
      'Here is my week. Tell me what I did wrong.',
      'Show the messy reality: a training log, a syllabus screenshot, a missed long run.',
      'Smash: you skipped the one session that mattered and did four that did not.',
      'Upload or paste the week, then the verdict. The mistake has to be specific.',
      'If the verdict is generic encouragement, reshoot with a harsher line.'
    ),
  },
  {
    appName: 'AbMax',
    formatName: 'That routine is ridiculous',
    founder: 'George Lampropoulos',
    showName: 'Superwall',
    priority: false,
    links: [
      { id: 'yt', label: 'Superwall — same episode, AbMax section', url: GEORGE },
    ],
    original: side(
      'This ab workout is ridiculous.',
      'Open on an intentionally absurd third-party clip. Let it run.',
      'Just use this instead. AbMax shows the exact workout.',
      'The top version lets the absurd clip run about 9 seconds and gets the product in by about 15. It became a major paid creative.',
      'Paid-social example. Still transferable. The bad version makes the simple version feel like relief.'
    ),
    smash: side(
      'You do not need a 16-step morning routine.',
      'Play the overcomplicated advice long enough to feel annoying. About nine seconds.',
      'Smash: today you only need these two things.',
      'Ridiculous plan, creator rejection, one simple Smash screen before 15 seconds.',
      'The contrast is the joke. Do not also explain the rest of the app.'
    ),
  },
  {
    appName: 'Brawler',
    formatName: 'Raw screen, no actor',
    founder: 'George Lampropoulos',
    showName: 'Superwall',
    priority: false,
    links: [
      { id: 'yt', label: 'Superwall — raw Brawler creative', url: GEORGE },
    ],
    original: side(
      'No hook actor. The screen recording is the ad.',
      'Raw product footage of the boxing or pad-work experience.',
      'The interaction itself. Polished UGC ads lost to this.',
      'Paid-social example. The episode contrasts the raw creative with produced ads that performed worse.',
      'Use when the Smash interaction is satisfying enough to watch with no story.'
    ),
    smash: side(
      'Goal. Today. Check. The bar moves.',
      'Phone in hand, no face, no music sting required.',
      'One session checked off. Momentum changes on screen.',
      'Record the satisfying click. If you need a voiceover to explain it, the interaction is not ready.',
      'Ranking videos from the same founder are a different card.'
    ),
  },
  {
    appName: 'Toxic Traits',
    formatName: 'Splash, upload, result',
    founder: 'Lotanna Ezeike',
    showName: 'Superwall',
    priority: false,
    links: [
      { id: 'yt', label: 'Superwall — jump to 3:43', url: yt('NmIHgCRd04E', '3:43') },
    ],
    original: side(
      'Branded splash. Then a screenshot going in.',
      'Three states, same rule as Praycreen, different product.',
      'Dramatic results page. Stop.',
      'Lotanna cites Toxic Traits while explaining why a short demo should show only three meaningful states.',
      'Same episode as Praycreen. Do not show onboarding on either.'
    ),
    smash: side(
      'Smash animation. Add where you actually are. Get the roadmap.',
      'Three frames: splash, the input, the personalised result.',
      'No menus. The result page has to look dramatic enough to be the last frame.',
      'Splash, current state, verdict. If you are explaining buttons, you added a fourth state.',
      'Pair with Praycreen. One is a daily action. This one is an assessment.'
    ),
  },
  {
    appName: 'Social Wizard',
    formatName: 'One screenshot that hurts',
    founder: 'Kelechi Onyeama',
    showName: 'Starter Story',
    priority: false,
    links: [
      { id: 'yt', label: 'Starter Story — 3:45 distribution, 7:45 playbook', url: '' },
    ],
    original: side(
      'What the hell do I reply to this?',
      'A real Instagram story or conversation screenshot. The pain is social and specific.',
      'Upload it. Pick a tone. The AI writes the reply.',
      'Not an abstract dating assistant. Every video is one tiny painful moment. Daily TikTok and Reels were central to growth.',
      'The screenshot is the script. If you have to explain the situation, the screenshot is wrong.'
    ),
    smash: side(
      'I have not studied in 9 days. What do I even do today?',
      'A notes app screenshot, a chat with a parent, a calendar full of skips.',
      'Smash writes today\'s recovery plan. One screen.',
      'One socially or academically painful artifact, then the plan. Do not say "goal management."',
      'Collect real screenshots from users. The uglier and more specific, the better.'
    ),
  },
  {
    appName: 'CiteSure',
    formatName: 'The name is the joke',
    founder: 'CiteSure founder',
    showName: 'Superwall',
    priority: false,
    links: [
      { id: 'yt', label: 'Superwall — CiteSure founder interview', url: '' },
    ],
    original: side(
      'I made a website called I-have-an-essay-due-at-midnight-and-ChatGPT-won\'t-stop-giving-me-fake-citations.',
      'The hook is the absurdly specific name. The specificity is the entertainment.',
      'Camera or founder, upload the citations, catch the fake ones, replace them.',
      'Their first substantive TikTok in this shape reportedly reached hundreds of thousands of views.',
      'Positioning you can say in one breath will beat a brand line you have to explain.'
    ),
    smash: side(
      'I made an app for people who make a 6-month goal and forget it three days later.',
      'Say the painfully specific job in the first sentence. The name can be ridiculous.',
      'Here is day three. Smash still has today written down.',
      'One specific failure mode, then the screen that exists because of it.',
      'Stronger than "smash your biggest goals." Use the long name as the hook, not as the logo.'
    ),
  },
  {
    appName: 'Vugola',
    formatName: 'Remake the grammar',
    founder: 'Vadim Strizheus',
    showName: 'Starter Story',
    priority: false,
    links: [
      { id: 'yt', label: 'Starter Story — 6:45, growth section', url: '' },
    ],
    original: side(
      'Same hook length as the video that already won.',
      'Find a competitor video that is performing. Copy the creative grammar, not the topic word for word.',
      'Same pacing, same reveal position, same audio feel. Swap in Vugola.',
      'He posts multiple times a day and treats short-form as a system. The Instagram push lined up with MRR moving from the low thousands to about $11K.',
      'Reverse engineer, remake, measure, mutate the winner. That is the editor operating system.'
    ),
    smash: side(
      'Take a winning Reel from this library. Match its length, cut, and reveal. Change only the goal.',
      'Do not invent a new structure on a Tuesday. Remake Monday\'s winner with a new first line.',
      'The Smash reveal stays on the same frame number as the original.',
      'Write the grammar down: hook length, transition, product frame, audio. Then shoot the Smash version inside those marks.',
      'Originality is a test bucket, not the default.'
    ),
  },
  {
    appName: 'Breezy',
    formatName: 'Sell the mockup',
    founder: 'Breezy founder',
    showName: 'Sub Club',
    priority: false,
    links: [
      { id: 'pod', label: 'Sub Club — 40:06', url: '' },
    ],
    original: side(
      'About 15 seconds, talking to camera, and the product does not exist yet.',
      'Founder explains the idea directly. No fake usage montage.',
      'Figma or mockup screenshots. Waitlist.',
      'One video reportedly generated around 5,000 waitlist signups. The Reel was the MVP.',
      'Before Expert Plans or any new Smash feature, make the Reel.'
    ),
    smash: side(
      'I am building a JEE plan that tells you the exact Physics chapter for today.',
      'Face, 15 seconds, one feature. Show the Figma frame.',
      'This screen is not live. If you want it, say so.',
      'Measure comments and signups before writing the feature. Kill the ones nobody asks about.',
      'A mockup that cannot be explained in 15 seconds is probably too vague to build.'
    ),
  },
  {
    appName: 'One Second Everyday',
    formatName: 'Duet the tutorial that is already winning',
    founder: 'Maddie Kirby',
    showName: 'Sub Club',
    priority: false,
    links: [
      { id: 'pod', label: 'Sub Club — viral duet around 27–34 min', url: '' },
    ],
    original: side(
      'A user\'s tutorial is already exploding. Duet it.',
      'The original post is the hook. The company does not restage it.',
      'Maddie walks through the actual app beside the user\'s explanation.',
      'People thought the company had built the app in response to the viral video. The original reached roughly 13M. The duet hit around 1M, then translated remakes spread it.',
      'The interview is with the social lead, not the founder. The move is still the one to copy. Reading Journey is a separate Maddie example.'
    ),
    smash: side(
      'When a goal video is already blowing up, stitch it the same day.',
      'Leave their video up. Smash plays beside the problem they described.',
      'You do not need a new system. This screen already does the thing they are asking for.',
      'Speed matters more than polish. A late, pretty duet loses to a fast, plain one.',
      'Keep a saved search for JEE, running, and habit videos so the stitch happens while the original is still moving.'
    ),
  },
  {
    appName: '3AK',
    formatName: 'Seed the culture, then drop the app',
    founder: 'Christian Rac & Braylin Byrd',
    showName: 'Starter Story',
    priority: false,
    links: [
      { id: 'yt', label: 'Starter Story — 4:51', url: '' },
      { id: 'ig', label: 'Instagram @3akings_', url: 'https://www.instagram.com/3akings_/' },
    ],
    original: side(
      'Normal track and sprint videos. The app is not announced.',
      'They built the audience with the sport first.',
      '"3AK" shows up inside those videos before launch, like a word the audience already knows.',
      'They did not flip the feed into ads. The name became familiar, then the app dropped into people who had already seen it.',
      'IG: @3akings_. Niche pages can seed Smash language before a pitch.'
    ),
    smash: side(
      'A JEE or running page that never says download.',
      'Use Smash words in passing: show-up, behind, today\'s session, the map.',
      'Weeks later, the app is obvious because the vocabulary is already theirs.',
      'Seed the phrase in native videos. Launch into that audience. Do not start with a product trailer.',
      'Pick one phrase per niche and repeat it until it sounds like slang, not marketing.'
    ),
  },
  {
    appName: 'Cat on Chair',
    formatName: 'One slide in someone else\'s list',
    founder: 'Ryan Yao',
    showName: 'Starter Story',
    priority: false,
    links: [
      { id: 'yt', label: 'Starter Story — app growth section', url: '' },
    ],
    original: side(
      'Cute apps I use. Cat on Chair is one of them.',
      'They get into collection posts instead of demanding a dedicated sponsored Reel.',
      'One slide, one cute use, then the roundup continues.',
      'One Instagram collection post reportedly crossed about 2M views, then jumped through Threads in Taiwan and moved downloads.',
      'Smash as one item in a list can beat Smash as the whole ad.'
    ),
    smash: side(
      '7 apps getting me through JEE. Smash is number 4.',
      'The video is the roundup. Smash gets one slide and one job.',
      'This is the one that tells me if I am actually behind.',
      'Target "apps I use for marathon training," "my 2027 phone setup," "how I study." Be a slide, not the sponsor.',
      'The slide has to show a result, not a logo.'
    ),
  },
  {
    appName: 'Pep AI',
    formatName: 'Useful advice, product last',
    founder: 'Cedric Roberge',
    showName: 'Superwall',
    priority: false,
    links: [
      { id: 'yt', label: 'Superwall — Cedric Roberge', url: yt('mOpYezjqU9c', '0:00') },
    ],
    original: side(
      'Things you need to do while taking X.',
      'Expert or creator education. The tracker is not the subject.',
      'Hydration, protein, training. "And track everything." Pep AI is the last tool.',
      'The product feels like the missing final step in advice that was already useful. He used trusted niche creators rather than generic influencers.',
      'The research also points at a Starter Story growth section around 9:59. This link is the Superwall episode with Cedric.'
    ),
    smash: side(
      '5 things you need with 100 days left for JEE.',
      'Four pieces of real advice a good student would agree with.',
      'The fifth: open the plan every day. That is Smash.',
      'Teach first. Smash is the last step, named once.',
      'The creator has to be credible in the niche. A random face reading five tips will not carry this.'
    ),
  },
  {
    appName: 'CutCoach',
    formatName: 'The transformation the niche already understands',
    founder: 'Ethan',
    showName: 'Starter Story',
    priority: false,
    links: [
      { id: 'yt', label: 'Starter Story — CutCoach', url: '' },
    ],
    original: side(
      'Before the weight cut. After the weight cut.',
      'The drama is native to the sport. You do not need to explain why the change matters.',
      'The process, then a CutCoach CTA. Hyper-relevant views converted even when the counts were small.',
      'Not a chase for 10M random viewers. Every viewer knows what the transformation means. TikTok, Reels, and influencers were acquisition channels.',
      'Small and specific can beat broad and huge.'
    ),
    smash: side(
      '100 days before the exam. Exam day.',
      'Two states the niche recognises instantly. Week-1 runner and first 10K. Day 1 and day 120.',
      'The plan between the two photos is Smash.',
      'Show both ends. The middle is the system. Do not explain the niche to outsiders.',
      'If a random scroller would not understand the stakes, you are in the right audience.'
    ),
  },
  {
    appName: 'Cal Buddy',
    formatName: 'Rebuild it in the local language',
    founder: 'Tomer',
    showName: 'Starter Story',
    priority: false,
    links: [
      { id: 'yt', label: 'Starter Story — Cal Buddy creator section', url: '' },
    ],
    original: side(
      'Not a translated American ad.',
      'He studied US calorie apps and Israeli fitness content, then rebuilt the ideas in the local language and culture.',
      'Local creators carry the localized format.',
      'Localization plus influencers took the app past its early revenue. The creative language changed, not just the subtitles.',
      'India JEE content should not look like an American productivity app with Hindi captions.'
    ),
    smash: side(
      'Use the Indian student meme, the hostel room, the coaching-centre joke.',
      'Start from formats that already work for JEE and running in India. Then put Smash inside them.',
      'The line should sound like the group chat, not like a translated landing page.',
      'Pick one local reference the US version would never use. If you cannot, it is still an import.',
      'Do this after a format wins in one language. Do not localize a format that has not won anywhere.'
    ),
  },
  {
    appName: 'BoldVoice',
    formatName: 'The score makes them react',
    founder: 'Anada Lakra',
    showName: 'Founder interviews',
    priority: false,
    links: [
      { id: 'pod', label: 'Founder podcast — growth section', url: '' },
    ],
    original: side(
      'Say the line. BoldVoice scores you.',
      'The creator speaks. The score comes back harsh or surprisingly low.',
      'The genuine reaction is the second half. The output feels personal.',
      'A sharable assessment manufactures content. Their growth also included guerrilla pronunciation content and creators.',
      'If Smash can hand someone a number, the number can be the video.'
    ),
    smash: side(
      'Smash says my goal is 31% on track.',
      'They expect a kinder number. The score is worse than their story.',
      'Reaction first. Then the one reason: this subject, this many skipped days.',
      'Give a score people will screenshot. The face after the score is the content.',
      'Do not round it into encouragement. The harsh specific number is why they react.'
    ),
  },
  {
    appName: 'Speechify',
    formatName: 'One face they recognise',
    founder: 'Cliff Weitzman',
    showName: 'Founder / growth interview',
    priority: false,
    links: [
      { id: 'yt', label: 'YouTube — around 18:35, character section', url: '' },
    ],
    original: side(
      'Same character, short setup, slightly absurd.',
      'Cliff plays an exaggerated version of himself: different voice, a stare, red headphones, 7–14 second setups.',
      'The bit feels closer to an old brand commercial than a UGC ad.',
      'A recurring founder character instead of endless anonymous actors. People learn the face.',
      'You do not need 100 unrelated people if one character becomes a shortcut.'
    ),
    smash: side(
      'Same jacket, same opening stare, a new goal every time.',
      'Build one Smash character people can recognise in the first frame.',
      'Seven to fourteen seconds. The absurd line, then one Smash screen.',
      'Repeat the character until the face is the format. Swap the goal underneath.',
      'Cast this on purpose. A random new actor every day fights the format.'
    ),
  },
  {
    appName: 'ParakeetAI',
    formatName: 'The magic moment',
    founder: 'Jure Sotosek',
    showName: 'Starter Story',
    priority: false,
    links: [
      { id: 'story', label: 'Starter Story — organic short-form strategy', url: '' },
    ],
    original: side(
      'Wait. It can do that during the interview?',
      'The interview question appears. The candidate looks stuck.',
      'Parakeet listens invisibly. The answer appears. They say it.',
      'He picked an app idea that could create surprising short-form. Organic short-form was the main distribution. Related founder businesses had already done hundreds of millions of views.',
      'Prefer features a stranger understands with the sound off.'
    ),
    smash: side(
      'I have not opened the syllabus in 11 days. Watch what it does.',
      'Show the stuck moment. Then the Smash output appears without a tutorial.',
      'Today\'s list is three lines. They start the first one on camera.',
      'The magic has to be visible: a verdict, a map, a refusal to let them skip. If you need to explain it, it is not this format.',
      'When choosing what to build next, ask whether a stranger would understand it in one shot.'
    ),
  },
  {
    appName: 'Maxed AI',
    formatName: 'The founder account is the test',
    founder: 'Max Hirsch',
    showName: 'Starter Story',
    priority: false,
    links: [
      { id: 'yt', label: 'Starter Story — 6:04 growth, 8:23 personal brand', url: '' },
    ],
    original: side(
      'I am building this. Here is the part that is broken.',
      'Lots of short founder clips. Product moments mixed with the journey.',
      'His face and account are the testing ground before a large creator system.',
      'Test quickly. Use the personal brand as distribution before you manufacture a network.',
      'Some of the highest-value Smash posts can be honest build updates.'
    ),
    smash: side(
      'I have 500 users and almost nobody comes back. Here is what I am building.',
      'Talk to camera about a real Smash problem. Show the screen you are changing.',
      'If this works, tomorrow\'s video is the result. If it does not, I will say that too.',
      'The startup diary is the format. Smash is the product inside the diary.',
      'Do not polish these into ads. The unfinished part is why people watch.'
    ),
  },
  {
    appName: 'Journable',
    formatName: 'One job, one result',
    founder: 'Steve Hoyek',
    showName: 'Starter Story',
    priority: false,
    links: [
      { id: 'yt', label: 'Starter Story — 7:38, ad example', url: '' },
    ],
    original: side(
      'One meal. One problem. Not a tour.',
      'Paid creative. The episode walks through an actual ad.',
      'Talk or type the meal. The AI understands it. The result appears.',
      'One complete job. Not every feature. The video ends when that job is done.',
      'Smash version of the rule: do not show Goals, Roadmap, Milestones, Routine, and Momentum in one Reel.'
    ),
    smash: side(
      'I do not know what to do today. That is the only problem in this video.',
      'One input. One Smash action. One result.',
      'Today is this session. Checked. Done.',
      'If a second feature appears, cut it. Make another Reel for that feature.',
      'Paid or organic, the constraint is the same.'
    ),
  },
  {
    appName: 'Stoppr',
    formatName: 'Join the challenge they are already filming',
    founder: 'David Attias',
    showName: 'Starter Story',
    priority: false,
    links: [
      { id: 'yt', label: 'Starter Story — 4:38, influencers around 7:08', url: '' },
    ],
    original: side(
      'Day X with no sugar. The creator was already making that video.',
      'He did not invent a new series. He continued theirs.',
      'Stoppr is the next step of the challenge, not a general app ad.',
      'He picked creators who had already worked with apps, inside a specific niche. Influencers became the main acquisition engine behind tens of thousands of downloads.',
      'Hire the person already doing the journey. Do not hire a generic productivity face.'
    ),
    smash: side(
      'Day 17. Road to the exam. The series already exists.',
      'Find "road to JEE," "road to a sub-2 half," "75-day glow-up."',
      'Smash is how they are keeping score inside a challenge they would film anyway.',
      'The creator\'s series is the format. Smash is a prop in episode 17, 18, and 19.',
      'If you have to brief them on what a goal is, they are the wrong creator.'
    ),
  },
  {
    appName: 'BeHard',
    formatName: 'Do the thing on camera',
    founder: 'Zakhar Azatian',
    showName: 'App Masters',
    priority: false,
    links: [
      { id: 'yt', label: 'BeHard founder interview', url: '' },
    ],
    original: side(
      'No one standing there explaining the app.',
      'They perform a challenge from the product.',
      'Cold shower, push-ups, run, the discipline task, then completion.',
      'The product is the behaviour it causes. The explanation is unnecessary if you can see them do it.',
      'Smash should sometimes be filmed as the action, not as the tracker.'
    ),
    smash: side(
      'This is today\'s Smash commitment. I am doing it now.',
      'The video is the workout, the chapter, the session. The app is not narrated.',
      'At the end they check it off. That is the only UI.',
      'Behaviour first, checkbox last. If the middle is a screen recording, you made the other Brawler card instead.',
      'The check-off is the credits. Do not add a speech after it.'
    ),
  },
  {
    appName: 'Brawler',
    formatName: 'Rank what they sent',
    founder: 'George Lampropoulos',
    showName: 'Superwall',
    priority: false,
    links: [
      { id: 'yt', label: 'Superwall — ranking and stitch creatives', url: GEORGE },
    ],
    original: side(
      'Ranking the technique people sent in.',
      'Comment on the footage, explain one correction, then the app ranking is the payoff.',
      'Stitch and ranking videos were strong enough to move into paid.',
      'Separate from Brawler\'s raw screen recording. This one needs other people\'s clips.',
      'The comments are the supply of the next video.'
    ),
    smash: side(
      'Ranking 5 study schedules people sent me.',
      'Read the goal and the deadline. Be blunt.',
      'Smash says this one is cooked, this one is fine, this one is lying about rest days.',
      'Marathon plans, JEE weeks, glow-up routines. Same ranking shape. Ask them to send the next one.',
      'An endless comment loop if the verdict is specific enough to argue with.'
    ),
  },
  {
    appName: 'Reading Journey',
    formatName: 'I want that for myself',
    founder: 'Maddie Kirby',
    showName: 'Sub Club',
    priority: false,
    links: [
      { id: 'pod', label: 'Maddie Kirby — bookshelf widget, separate from 1SE', url: '' },
    ],
    original: side(
      'A bookshelf widget on the home screen. One line of explanation.',
      'The object creates the want. No complex video.',
      'People see someone else\'s shelf and want their own.',
      'Maddie says the TikTok or Threads post drove 1,000+ downloads in a day and pushed the app into the top 20 Books apps. This is a newer case than the 1SE duet.',
      'You need surfaces people see and immediately want generated for themselves.'
    ),
    smash: side(
      'My 100-day JEE map.',
      'One beautiful Smash output, full frame. A goal garden, a road to the race, a year of showing up.',
      'No tour. The object is the ad. Caption: yours takes a minute.',
      'Show an output that feels personal and slightly enviable. The next step is "make mine."',
      'If the screen looks like a settings page, it is not this format.'
    ),
  },
];
