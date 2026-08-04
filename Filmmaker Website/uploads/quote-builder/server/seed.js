const db = require('./db');

function seed() {
  const count = db.prepare('SELECT COUNT(*) as c FROM catalogue').get().c;
  if (count > 0) return;

  const CATALOGUE = {
    crew: [
      { n: 'Videographer / DP', r: 900, u: 'day' },
      { n: 'Camera operator (2nd)', r: 750, u: 'day' },
      { n: 'Director', r: 1100, u: 'day' },
      { n: 'Producer', r: 900, u: 'day' },
      { n: 'Sound recordist', r: 800, u: 'day' },
      { n: 'Gaffer / lighting tech', r: 700, u: 'day' },
      { n: 'Grip', r: 600, u: 'day' },
      { n: 'PA / runner', r: 350, u: 'day' },
      { n: 'Video editor', r: 50, u: 'hour' },
      { n: 'Colourist', r: 120, u: 'hour' },
      { n: 'Motion graphics artist', r: 110, u: 'hour' },
      { n: 'DIT (digital imaging tech)', r: 650, u: 'day' },
    ],
    camera: [
      { n: 'BMPCC 4K', r: 100, u: 'day' },
      { n: 'BMPCC 6K Pro', r: 150, u: 'day' },
      { n: 'Sony FX3 (full-frame)', r: 200, u: 'day' },
      { n: 'Sony FX6 (full-frame)', r: 299, u: 'day' },
      { n: 'Sony FX9 (full-frame)', r: 400, u: 'day' },
      { n: 'Canon EOS C70', r: 200, u: 'day' },
      { n: 'Canon EOS C300 Mk III', r: 350, u: 'day' },
      { n: 'RED Komodo 6K', r: 350, u: 'day' },
      { n: 'RED DSMC2 MONSTRO 8K', r: 600, u: 'day' },
      { n: 'ARRI Alexa Mini LF', r: 900, u: 'day' },
      { n: 'DJI Ronin 4D (6K)', r: 500, u: 'day' },
      { n: 'GoPro Hero 13', r: 60, u: 'day' },
      { n: 'Insta360 X4', r: 50, u: 'day' },
    ],
    lens: [
      { n: 'Canon EF 24-70mm f/2.8L II', r: 70, u: 'day' },
      { n: 'Canon EF 70-200mm f/2.8L III', r: 80, u: 'day' },
      { n: 'Canon EF 16-35mm f/2.8L III', r: 80, u: 'day' },
      { n: 'Canon EF 50mm f/1.2L', r: 60, u: 'day' },
      { n: 'Canon EF 85mm f/1.4L', r: 60, u: 'day' },
      { n: 'Canon RF 24-70mm f/2.8L IS', r: 80, u: 'day' },
      { n: 'Canon RF 70-200mm f/2.8L IS', r: 90, u: 'day' },
      { n: 'Canon RF 15-35mm f/2.8L IS', r: 80, u: 'day' },
      { n: 'Sony FE 24-70mm f/2.8 GM', r: 70, u: 'day' },
      { n: 'Sony FE 70-200mm f/2.8 GM II', r: 99, u: 'day' },
      { n: 'Sony FE 16-35mm f/2.8 GM II', r: 79, u: 'day' },
      { n: 'Sony FE 50mm f/1.2 GM', r: 79, u: 'day' },
      { n: 'Sony FE 85mm f/1.4 GM', r: 78, u: 'day' },
      { n: 'Sigma 18-35mm f/1.8 Art (EF)', r: 45, u: 'day' },
      { n: 'Sigma 24-70mm f/2.8 DG DN Art', r: 60, u: 'day' },
      { n: 'Metabones EF–E Speed Booster', r: 30, u: 'day' },
    ],
    audio: [
      { n: 'Rode NTG3 shotgun mic', r: 40, u: 'day' },
      { n: 'Rode NTG4+ shotgun mic', r: 30, u: 'day' },
      { n: 'Rode VideoMic NTG (on-cam)', r: 20, u: 'day' },
      { n: 'Rode Wireless GO II (dual)', r: 45, u: 'day' },
      { n: 'Sennheiser EW112-p G4 lav kit', r: 30, u: 'day' },
      { n: 'Sennheiser EW135-p G4 handheld', r: 30, u: 'day' },
      { n: 'DJI Mic 2 (dual wireless)', r: 30, u: 'day' },
      { n: 'Sound Devices MixPre-6 II', r: 80, u: 'day' },
      { n: 'Zoom F6 multitrack recorder', r: 50, u: 'day' },
      { n: 'Zoom H6 handy recorder', r: 35, u: 'day' },
      { n: 'Boom pole (Rode mini)', r: 10, u: 'day' },
      { n: 'Rode Blimp windshield kit', r: 25, u: 'day' },
      { n: 'NTG4+ boom kit (pole+blimp)', r: 50, u: 'day' },
    ],
    lighting: [
      { n: 'Aputure LS 120D II (daylight)', r: 58, u: 'day' },
      { n: 'Aputure LS 300X (bi-colour)', r: 80, u: 'day' },
      { n: 'Aputure LS 600D Pro (daylight)', r: 140, u: 'day' },
      { n: 'Aputure LS 60X (bi-colour)', r: 50, u: 'day' },
      { n: 'Aputure Amaran F22X (2x2 flex)', r: 60, u: 'day' },
      { n: 'Aputure Amaran F22C (2x2 RGB)', r: 60, u: 'day' },
      { n: 'Aputure Amaran F21C (2x1 RGB)', r: 50, u: 'day' },
      { n: 'Aputure Amaran 300C (RGB)', r: 68, u: 'day' },
      { n: 'Aputure Nova P300c (RGBWW)', r: 100, u: 'day' },
      { n: 'Aputure Storm 80C (3-head kit)', r: 160, u: 'day' },
      { n: 'Aputure Light Dome II softbox', r: 20, u: 'day' },
      { n: 'Aputure Fresnel 2X attachment', r: 10, u: 'day' },
      { n: 'Nanlite PavoTube II 30X (x2)', r: 60, u: 'day' },
      { n: 'Godox AD600 Pro (strobe)', r: 70, u: 'day' },
      { n: '5-in-1 reflector', r: 10, u: 'day' },
      { n: 'V-mount battery + charger', r: 40, u: 'day' },
      { n: 'Light stand (per stand)', r: 10, u: 'day' },
      { n: 'C-stand', r: 15, u: 'day' },
    ],
    grip: [
      { n: 'DJI RS 4 Pro gimbal', r: 100, u: 'day' },
      { n: 'DJI RS 3 Pro gimbal', r: 70, u: 'day' },
      { n: 'DJI RS 5 gimbal', r: 90, u: 'day' },
      { n: 'Sachtler Ace XL fluid head tripod', r: 35, u: 'day' },
      { n: 'Manfrotto 504X video tripod', r: 25, u: 'day' },
      { n: 'Dana Dolly + track kit', r: 120, u: 'day' },
      { n: 'Slider (60cm)', r: 40, u: 'day' },
      { n: 'Slider (100cm)', r: 60, u: 'day' },
      { n: 'Shoulder rig kit', r: 40, u: 'day' },
      { n: 'Follow focus unit', r: 30, u: 'day' },
      { n: 'Matte box', r: 25, u: 'day' },
      { n: 'Monitor (5-7in, on-cam)', r: 40, u: 'day' },
      { n: "Monitor (17in director's)", r: 80, u: 'day' },
      { n: 'V-lock plate + baseplate', r: 20, u: 'day' },
      { n: 'Easyrig Minimax', r: 85, u: 'day' },
    ],
    post: [
      { n: 'DaVinci Resolve edit suite', r: 100, u: 'day' },
      { n: 'Avid Media Composer suite', r: 150, u: 'day' },
      { n: 'Adobe Premiere edit suite', r: 100, u: 'day' },
      { n: 'Colour grading suite (full)', r: 350, u: 'day' },
      { n: 'SSD media (1TB)', r: 20, u: 'day' },
      { n: 'CFexpress card (160GB)', r: 25, u: 'day' },
      { n: 'SD card UHS-II (256GB)', r: 15, u: 'day' },
    ],
  };

  const insert = db.prepare(
    'INSERT INTO catalogue (category, name, rate, unit) VALUES (?, ?, ?, ?)'
  );

  const catalogueIds = {};
  const insertAll = db.transaction(() => {
    for (const [category, items] of Object.entries(CATALOGUE)) {
      catalogueIds[category] = [];
      for (const item of items) {
        const info = insert.run(category, item.n, item.r, item.u);
        catalogueIds[category].push(info.lastInsertRowid);
      }
    }
  });
  insertAll();

  const PRESETS = [
    {
      slug: 'interview',
      name: 'Interview / talking head',
      items: [
        { cat: 'crew', idx: 0, q: 1, d: 1 },
        { cat: 'crew', idx: 8, q: 4, d: 1 },
        { cat: 'camera', idx: 2, q: 1, d: 1 },
        { cat: 'lens', idx: 13, q: 1, d: 1 },
        { cat: 'audio', idx: 4, q: 1, d: 1 },
        { cat: 'audio', idx: 0, q: 1, d: 1 },
        { cat: 'lighting', idx: 0, q: 2, d: 1 },
        { cat: 'lighting', idx: 10, q: 1, d: 1 },
        { cat: 'grip', idx: 5, q: 1, d: 1 },
      ],
    },
    {
      slug: 'rungun',
      name: 'Run & gun / doco',
      items: [
        { cat: 'crew', idx: 0, q: 1, d: 1 },
        { cat: 'crew', idx: 8, q: 3, d: 1 },
        { cat: 'camera', idx: 3, q: 1, d: 1 },
        { cat: 'lens', idx: 6, q: 1, d: 1 },
        { cat: 'lens', idx: 0, q: 1, d: 1 },
        { cat: 'audio', idx: 3, q: 1, d: 1 },
        { cat: 'audio', idx: 0, q: 1, d: 1 },
        { cat: 'lighting', idx: 5, q: 1, d: 1 },
        { cat: 'grip', idx: 0, q: 1, d: 1 },
        { cat: 'grip', idx: 5, q: 1, d: 1 },
      ],
    },
    {
      slug: 'corporate',
      name: 'Corporate promo (1-day shoot)',
      items: [
        { cat: 'crew', idx: 0, q: 1, d: 1 },
        { cat: 'crew', idx: 2, q: 1, d: 1 },
        { cat: 'crew', idx: 8, q: 6, d: 1 },
        { cat: 'camera', idx: 3, q: 1, d: 1 },
        { cat: 'camera', idx: 2, q: 1, d: 1 },
        { cat: 'lens', idx: 0, q: 1, d: 1 },
        { cat: 'lens', idx: 1, q: 1, d: 1 },
        { cat: 'audio', idx: 4, q: 2, d: 1 },
        { cat: 'audio', idx: 6, q: 1, d: 1 },
        { cat: 'lighting', idx: 2, q: 1, d: 1 },
        { cat: 'lighting', idx: 1, q: 2, d: 1 },
        { cat: 'lighting', idx: 10, q: 2, d: 1 },
        { cat: 'grip', idx: 5, q: 1, d: 1 },
        { cat: 'grip', idx: 4, q: 1, d: 1 },
        { cat: 'post', idx: 0, q: 1, d: 1 },
      ],
    },
    {
      slug: 'narrative',
      name: 'Narrative / short film day',
      items: [
        { cat: 'crew', idx: 0, q: 1, d: 1 },
        { cat: 'crew', idx: 1, q: 1, d: 1 },
        { cat: 'crew', idx: 2, q: 1, d: 1 },
        { cat: 'crew', idx: 4, q: 1, d: 1 },
        { cat: 'crew', idx: 5, q: 1, d: 1 },
        { cat: 'crew', idx: 11, q: 1, d: 1 },
        { cat: 'camera', idx: 5, q: 1, d: 1 },
        { cat: 'lens', idx: 0, q: 1, d: 1 },
        { cat: 'lens', idx: 2, q: 1, d: 1 },
        { cat: 'lens', idx: 4, q: 1, d: 1 },
        { cat: 'audio', idx: 6, q: 1, d: 1 },
        { cat: 'audio', idx: 0, q: 1, d: 1 },
        { cat: 'audio', idx: 10, q: 1, d: 1 },
        { cat: 'lighting', idx: 2, q: 1, d: 1 },
        { cat: 'lighting', idx: 1, q: 2, d: 1 },
        { cat: 'lighting', idx: 13, q: 2, d: 1 },
        { cat: 'grip', idx: 2, q: 1, d: 1 },
        { cat: 'grip', idx: 5, q: 1, d: 1 },
        { cat: 'grip', idx: 7, q: 1, d: 1 },
        { cat: 'post', idx: 0, q: 1, d: 1 },
      ],
    },
    {
      slug: 'event',
      name: 'Event / multi-cam',
      items: [
        { cat: 'crew', idx: 0, q: 1, d: 1 },
        { cat: 'crew', idx: 1, q: 2, d: 1 },
        { cat: 'crew', idx: 3, q: 1, d: 1 },
        { cat: 'crew', idx: 4, q: 1, d: 1 },
        { cat: 'camera', idx: 3, q: 2, d: 1 },
        { cat: 'camera', idx: 1, q: 1, d: 1 },
        { cat: 'lens', idx: 8, q: 1, d: 1 },
        { cat: 'lens', idx: 9, q: 1, d: 1 },
        { cat: 'audio', idx: 5, q: 2, d: 1 },
        { cat: 'audio', idx: 6, q: 1, d: 1 },
        { cat: 'lighting', idx: 3, q: 4, d: 1 },
        { cat: 'grip', idx: 5, q: 3, d: 1 },
        { cat: 'grip', idx: 11, q: 1, d: 1 },
        { cat: 'post', idx: 0, q: 1, d: 1 },
      ],
    },
  ];

  const insertPreset = db.prepare(
    'INSERT INTO presets (name, slug) VALUES (?, ?)'
  );
  const insertPresetItem = db.prepare(
    'INSERT INTO preset_items (preset_id, catalogue_id, qty, days) VALUES (?, ?, ?, ?)'
  );

  const seedPresets = db.transaction(() => {
    for (const preset of PRESETS) {
      const info = insertPreset.run(preset.name, preset.slug);
      const presetId = info.lastInsertRowid;
      for (const item of preset.items) {
        const catalogueId = catalogueIds[item.cat][item.idx];
        insertPresetItem.run(presetId, catalogueId, item.q, item.d);
      }
    }
  });
  seedPresets();

  console.log('Database seeded successfully');
}

module.exports = seed;
