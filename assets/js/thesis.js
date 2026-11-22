/* Undergraduate thesis (UNESA, 2022): content for the expandable thesis story in Education.
 * Every number comes from the thesis (Ch. I scope, Ch. III method, Ch. IV results, Ch. V conclusions). */
window.THESIS = {
  variants: ['plain', '90', '60', '45'],
  // Ch. IV tables 4.2 - 4.13 (averages of 3 runs per variant)
  metrics: {
    eff:   { v: [10, 20, 19, 19], unit: '%', dec: 0, min: 0, better: 'high' },
    qc:    { v: [1.30, 2.77, 2.59, 2.53], unit: 'kJ/s', dec: 2, min: 0, better: 'high' },
    qh:    { v: [0.65, 2.17, 3.18, 3.48], unit: 'kJ/s', dec: 2, min: 0, better: 'high' },
    dp:    { v: [3900, 3950, 4000, 4300], unit: 'Pa', dec: 0, min: 3800, better: 'low' },
    ratio: { v: [0.00307, 0.00657, 0.00618, 0.00604], unit: '%', dec: 5, min: 0, better: 'high' },
    u:     { v: [7.84, 13.58, 13.70, 13.70], unit: 'W/m²K', dec: 2, min: 0, better: 'high' },
    area:  { v: [0.11, 0.21, 0.22, 0.25], unit: 'm²', dec: 2, min: 0, better: 'high' },
    lmtd:  { v: [47.76, 43.34, 41.23, 40.65], unit: '°C', dec: 2, min: 30, better: 'none' },
    qloss: { v: [0.38, 0.55, 1.68, 1.43], unit: 'kJ/s', dec: 2, min: 0, better: 'low' },
    tins:  { v: [35.3, 37.0, 37.7, 37.4], unit: '°C', dec: 1, min: 30, better: 'low' }
  },
  dT: { h: [2.4, 8.0, 11.7, 12.8], c: [2.2, 4.7, 4.4, 4.3] },
  journal: 'https://ejournal.unesa.ac.id/index.php/jtm-unesa/article/view/50131',

  en: {
    open: 'Explore the thesis', close: 'Close the thesis',
    kicker: 'Undergraduate thesis · Universitas Negeri Surabaya · 2022',
    title: 'Does tilting a baffle make a heat exchanger better?',
    full: 'Experimental study of the inclination angle of semi-circular perforated baffles with semi-circular fins on the annulus side, on the performance of a double pipe heat exchanger',
    meta: [['Supervisor', 'Dr. I Made Arsana, S.Pd., M.T.'], ['Lab', 'Heat Transfer Lab A8.02.01, UNESA'], ['Concentration', 'Energy conversion'], ['Method', 'Experiment, 3 runs per variant']],
    tabs: ['The question', 'The design', 'Building it', 'Testing', 'Results', 'What I learned'],
    variantNames: ['No baffle', '90°', '60°', '45°'],

    q: {
      lead: 'A double pipe heat exchanger is the simplest exchanger there is: hot water runs through a copper pipe, cold water runs the other way in the gap around it, and heat crosses the copper wall.',
      body: [
        'To get more heat across, you can put baffles in that gap. They add surface and stir the flow, so the cold water touches the hot wall for longer. The catch is that anything you put in the way also makes the pump work harder, which shows up as pressure drop.',
        'Earlier studies showed that perforated, semi-circular baffles help. What nobody had pinned down was the angle. Tilt the baffle and it gets more surface, but it also blocks the flow differently. So I built one exchanger and tested it four ways: with no baffles, and with baffles tilted at 90°, 60° and 45°.'
      ],
      tradeUp: 'More heat transferred', tradeDown: 'More pressure drop', tradeQ: 'Which angle gives the best balance?',
      fixed: 'Kept the same in every test',
      fixedItems: [['Hot water in', '80 °C, 4 L/min, inner pipe'], ['Cold water in', '30 °C, 8.5 L/min, annulus'], ['Flow', 'Counter flow'], ['Baffles', '18 copper baffles, same gap to the shell at every angle']]
    },

    d: {
      lead: 'Pick a variant to see how the baffles sit in the annulus and how the two streams move.',
      flowHot: 'Hot water · 80 °C · 4 L/min', flowCold: 'Cold water · 30 °C · 8.5 L/min',
      baffleTitle: 'One baffle, face on',
      baffleNote: 'Copper disc, 68 mm across and 0.75 mm thick, with 8 semi-circular perforations of 13 mm. The cut tabs are bent out as small fins.',
      specs: [
        ['Outer pipe', 'Stainless steel 304 · Ø76.2 × 2 mm · 1,100 mm long'],
        ['Inner pipe', 'Copper · Ø35 × 1 mm · 1,100 mm long'],
        ['Baffles', '18 × copper, Ø68 mm, 0.75 mm thick'],
        ['Perforations', '8 semi-circular holes, Ø13 mm each'],
        ['Tilt angles', '90°, 60°, 45° and a plain pipe for reference'],
        ['Insulation', 'Aluminium thermal foam, 4 mm']
      ],
      areaNote: 'A flatter tilt makes each baffle reach further across the gap, so the heat transfer area grows from 0.11 m² (plain) to 0.25 m² at 45°.'
    },

    b: {
      lead: 'I designed the parts in CAD, had the baffles laser cut, and assembled the rig with a local workshop.',
      steps: [
        ['Design', '3D model of the exchanger and the full test rig, then 2D drawings for fabrication.', 'dphe-3d'],
        ['Nesting', 'All 54 baffles (three angle sets of 18) nested on copper sheet as a DXF for the laser.', 'dxf-nesting'],
        ['Laser cutting', 'Cut at Grand Laser Lab, Wiyung, Surabaya.', 'laser-cutting'],
        ['Copper baffles', 'Cut baffles with their semi-circular tabs, ready to be bent into fins.', 'baffles-cut'],
        ['Setting the angle', 'Each baffle set on the inner pipe and checked with a protractor: 90°, 60° or 45°.', 'angle-check'],
        ['Three finned pipes', 'One inner pipe per angle, so a test only needs the pipe swapped.', 'finned-pipes'],
        ['Shell and rig', 'Outer pipe, flanges, pumps, tanks and piping built at CV Makmur Jaya, Kletek, Sidoarjo.', 'flange']
      ],
      pub: 'The design and build of this test rig is published as an article in JTM-UNESA (Jurnal Teknik Mesin, Universitas Negeri Surabaya).',
      pubLink: 'Read the article'
    },

    t: {
      lead: 'Two loops, one heater, and a lot of waiting for the numbers to settle.',
      instruments: [
        ['Temperature', 'Type K thermocouples with an REX-C100 thermocontrol, plus an XH-B310 display for the insulation surface'],
        ['Pressure', 'SKON gauges, 0 to 5 kPa, at every inlet and outlet'],
        ['Flow', 'SANLIXIN flowmeters, 1 to 18 L/min'],
        ['Heat and pumps', '1,000 W heating element and two National GP-125 pumps']
      ],
      steps: [
        'Heat the hot tank to 80 °C and bring the cold tank to 30 °C.',
        'Start the cold loop, set 8.5 L/min, wait about 4 minutes for it to settle.',
        'Start the hot loop, set 4 L/min, wait about 2 minutes until temperatures stop moving.',
        'Read inlet and outlet temperatures, pressures, flows and the insulation surface temperature.',
        'Repeat three times, then swap the finned pipe and test the next angle.'
      ],
      photos: [['schematic', 'Test rig schematic: hot loop in red, cold loop in blue'], ['control-panel', 'Control panel: thermocontrol readouts during a run'], ['rig', 'The rig in the Heat Transfer Lab'], ['rig-3d', '3D model of the full rig']]
    },

    r: {
      lead: 'Pick a result. Bars show the average of three runs for each variant.',
      kpis: [['Effectiveness', '10% → 20%', 'Doubled with 90° baffles'], ['Heat actually received', '1.30 → 2.77 kJ/s', 'Cold side, plain vs 90°'], ['Price paid', '+50 Pa', 'Pressure drop 3,900 → 3,950 Pa']],
      metrics: {
        eff: ['Effectiveness', 'How much of the heat that could move actually moved. 90° is best at 20%, twice the plain pipe. Going flatter adds area but not effectiveness.'],
        qc: ['Heat received by the cold side', 'This is the useful heat. It peaks at 90° (2.77 kJ/s) and drops a little at 60° and 45°: the cold water moves through faster, so it has less time to pick heat up.'],
        qh: ['Heat released by the hot side', 'Keeps rising as the baffles tilt flatter, because there is more surface. Not all of it reaches the cold water, which is why the cold side tells a different story.'],
        dp: ['Pressure drop, annulus', 'The cost of the baffles. Small at 90° (+50 Pa over plain), largest at 45° (4,300 Pa). The axis starts at 3,800 Pa so the differences are visible.'],
        ratio: ['Effectiveness ÷ pressure drop', 'The balance I was looking for. 90° wins: the most effectiveness for each pascal of pressure drop.'],
        u: ['Overall heat transfer coefficient, U', 'Almost doubles once baffles are in, and is about the same for every angle.'],
        area: ['Heat transfer area', 'A flatter tilt makes each baffle reach further, so the area grows from 0.11 to 0.25 m².'],
        lmtd: ['Log mean temperature difference', 'Falls as more heat moves across, because the outlet temperatures get closer together. The axis starts at 30 °C.'],
        qloss: ['Heat lost to the room', 'Highest at 60° (1.68 kJ/s). More turbulence pushes more heat to the outer wall, so baffled exchangers need thicker insulation.'],
        tins: ['Insulation surface temperature', 'Average of 4 points along the shell. It tracks the heat loss: warmest at 60° (37.7 °C). The axis starts at 30 °C.']
      },
      best: 'best', note: 'Averages of 3 runs. Hot 80 °C, 4 L/min; cold 30 °C, 8.5 L/min.'
    },

    l: {
      verdict: 'The answer: 90°.',
      verdictBody: 'Baffles at 90° doubled the exchanger’s effectiveness, from 10% to 20%, and raised the heat the cold water actually received from 1.30 to 2.77 kJ/s, for only 50 Pa more pressure drop. Flatter angles gave more surface but not more useful heat, and cost more pressure.',
      learnedTitle: 'What surprised me',
      learned: [
        'More area did not mean more useful heat. At 60° and 45° the hot side gave off more heat, but the cold side received less: the time the water spends in contact matters as much as the surface.',
        'For two of the variants (no baffle and 90°) the cold side picked up more heat than the hot side gave. That cannot be physically true, so I reported it as an anomaly, most likely from instrument accuracy or reading before the rig was fully steady.',
        'Baffles stir the flow and push heat to the outer wall. An exchanger with baffles needs thicker insulation than a plain one.'
      ],
      nextTitle: 'What I would do next',
      next: [
        'Log temperatures every second with a microcontroller instead of reading displays by hand.',
        'Measure insulation temperature at more than four points, and calculate convection to the room.',
        'Look into the unsteady inlet pressure on the annulus side (water hammer).',
        'Check the mechanical side too: the shell against ASME Section VIII and the hot piping for thermal expansion (ASME B31).'
      ]
    }
  },

  id: {
    open: 'Lihat skripsi', close: 'Tutup skripsi',
    kicker: 'Skripsi S1 · Universitas Negeri Surabaya · 2022',
    title: 'Apakah memiringkan baffle membuat heat exchanger lebih baik?',
    full: 'Studi eksperimental pengaruh sudut kemiringan semi-circular perforated baffle dengan semi circular fins pada sisi annulus terhadap performa double pipe heat exchanger',
    meta: [['Pembimbing', 'Dr. I Made Arsana, S.Pd., M.T.'], ['Lab', 'Lab Perpindahan Panas A8.02.01, UNESA'], ['Konsentrasi', 'Konversi energi'], ['Metode', 'Eksperimen, 3 kali per variasi']],
    tabs: ['Pertanyaannya', 'Desainnya', 'Membuatnya', 'Pengujian', 'Hasil', 'Yang saya pelajari'],
    variantNames: ['Tanpa baffle', '90°', '60°', '45°'],

    q: {
      lead: 'Double pipe heat exchanger adalah penukar kalor paling sederhana: air panas mengalir di pipa tembaga, air dingin mengalir berlawanan arah di celah sekelilingnya, dan kalor berpindah lewat dinding tembaga.',
      body: [
        'Supaya kalor yang berpindah lebih banyak, celah itu bisa diberi baffle. Baffle menambah luas permukaan dan mengaduk aliran, sehingga air dingin lebih lama bersentuhan dengan dinding panas. Masalahnya, apa pun yang menghalangi aliran juga membuat pompa bekerja lebih berat, dan itu terlihat sebagai pressure drop.',
        'Penelitian sebelumnya menunjukkan baffle setengah lingkaran berlubang itu membantu. Yang belum ditemukan adalah sudutnya. Kalau baffle dimiringkan, luasnya bertambah, tapi cara ia menghalangi aliran juga berubah. Jadi saya membuat satu heat exchanger dan mengujinya dengan empat cara: tanpa baffle, serta dengan baffle bersudut 90°, 60°, dan 45°.'
      ],
      tradeUp: 'Kalor yang berpindah bertambah', tradeDown: 'Pressure drop bertambah', tradeQ: 'Sudut mana yang paling seimbang?',
      fixed: 'Dibuat sama di setiap pengujian',
      fixedItems: [['Air panas masuk', '80 °C, 4 L/menit, inner pipe'], ['Air dingin masuk', '30 °C, 8,5 L/menit, annulus'], ['Arah aliran', 'Counter flow'], ['Baffle', '18 baffle tembaga, jarak ke shell sama di setiap sudut']]
    },

    d: {
      lead: 'Pilih variasi untuk melihat posisi baffle di annulus dan gerak kedua aliran.',
      flowHot: 'Air panas · 80 °C · 4 L/menit', flowCold: 'Air dingin · 30 °C · 8,5 L/menit',
      baffleTitle: 'Satu baffle, tampak depan',
      baffleNote: 'Piringan tembaga berdiameter 68 mm dan tebal 0,75 mm, dengan 8 lubang setengah lingkaran berdiameter 13 mm. Potongannya ditekuk keluar menjadi sirip kecil.',
      specs: [
        ['Outer pipe', 'Stainless steel 304 · Ø76,2 × 2 mm · panjang 1.100 mm'],
        ['Inner pipe', 'Tembaga · Ø35 × 1 mm · panjang 1.100 mm'],
        ['Baffle', '18 × tembaga, Ø68 mm, tebal 0,75 mm'],
        ['Perforasi', '8 lubang setengah lingkaran, masing-masing Ø13 mm'],
        ['Sudut kemiringan', '90°, 60°, 45°, dan pipa polos sebagai pembanding'],
        ['Insulasi', 'Thermal foam aluminium, 4 mm']
      ],
      areaNote: 'Makin landai sudutnya, makin jauh setiap baffle menjangkau celah, sehingga luas perpindahan kalor naik dari 0,11 m² (polos) menjadi 0,25 m² pada 45°.'
    },

    b: {
      lead: 'Saya mendesain komponennya di CAD, memotong baffle dengan laser, lalu merakit alat uji bersama bengkel lokal.',
      steps: [
        ['Desain', 'Model 3D heat exchanger dan seluruh alat uji, lalu gambar 2D untuk fabrikasi.', 'dphe-3d'],
        ['Nesting', 'Semua 54 baffle (tiga set sudut, masing-masing 18) disusun di lembar tembaga sebagai DXF untuk laser.', 'dxf-nesting'],
        ['Potong laser', 'Dipotong di Grand Laser Lab, Wiyung, Surabaya.', 'laser-cutting'],
        ['Baffle tembaga', 'Baffle hasil potong beserta tab setengah lingkarannya, siap ditekuk menjadi sirip.', 'baffles-cut'],
        ['Mengatur sudut', 'Setiap baffle dipasang di inner pipe dan dicek dengan busur: 90°, 60°, atau 45°.', 'angle-check'],
        ['Tiga pipa bersirip', 'Satu inner pipe untuk setiap sudut, jadi pengujian cukup dengan menukar pipanya.', 'finned-pipes'],
        ['Shell dan alat uji', 'Outer pipe, flange, pompa, tangki, dan perpipaan dibuat di CV Makmur Jaya, Kletek, Sidoarjo.', 'flange']
      ],
      pub: 'Desain dan pembuatan alat uji ini dipublikasikan sebagai artikel di JTM-UNESA (Jurnal Teknik Mesin, Universitas Negeri Surabaya).',
      pubLink: 'Baca artikelnya'
    },

    t: {
      lead: 'Dua loop, satu pemanas, dan banyak menunggu sampai angkanya stabil.',
      instruments: [
        ['Temperatur', 'Thermocouple tipe K dengan thermocontrol REX-C100, plus display XH-B310 untuk permukaan insulasi'],
        ['Tekanan', 'Pressure gauge SKON, 0 sampai 5 kPa, di setiap inlet dan outlet'],
        ['Debit', 'Flowmeter SANLIXIN, 1 sampai 18 L/menit'],
        ['Pemanas dan pompa', 'Heating element 1.000 W dan dua pompa National GP-125']
      ],
      steps: [
        'Panaskan tangki panas sampai 80 °C dan kondisikan tangki dingin di 30 °C.',
        'Nyalakan loop dingin, atur 8,5 L/menit, tunggu sekitar 4 menit sampai stabil.',
        'Nyalakan loop panas, atur 4 L/menit, tunggu sekitar 2 menit sampai temperatur tidak berubah.',
        'Catat temperatur masuk dan keluar, tekanan, debit, dan temperatur permukaan insulasi.',
        'Ulangi tiga kali, lalu tukar pipa bersirip dan uji sudut berikutnya.'
      ],
      photos: [['schematic', 'Skema alat uji: loop panas merah, loop dingin biru'], ['control-panel', 'Panel kontrol: pembacaan thermocontrol saat pengujian'], ['rig', 'Alat uji di Lab Perpindahan Panas'], ['rig-3d', 'Model 3D seluruh alat uji']]
    },

    r: {
      lead: 'Pilih hasil. Batang menunjukkan rata-rata tiga kali pengujian untuk setiap variasi.',
      kpis: [['Efektivitas', '10% → 20%', 'Dua kali lipat dengan baffle 90°'], ['Kalor yang benar-benar diterima', '1,30 → 2,77 kJ/s', 'Sisi dingin, polos vs 90°'], ['Harga yang dibayar', '+50 Pa', 'Pressure drop 3.900 → 3.950 Pa']],
      metrics: {
        eff: ['Efektivitas', 'Seberapa banyak kalor yang mungkin berpindah yang benar-benar berpindah. 90° terbaik di 20%, dua kali pipa polos. Sudut lebih landai menambah luas tapi tidak menambah efektivitas.'],
        qc: ['Kalor yang diterima sisi dingin', 'Inilah kalor yang berguna. Puncaknya di 90° (2,77 kJ/s) dan sedikit turun di 60° dan 45°: air dingin mengalir lebih cepat, jadi waktunya untuk menyerap kalor lebih singkat.'],
        qh: ['Kalor yang dilepas sisi panas', 'Terus naik saat baffle makin landai karena permukaannya bertambah. Tidak semuanya sampai ke air dingin, karena itu sisi dingin menunjukkan hasil yang berbeda.'],
        dp: ['Pressure drop, annulus', 'Ongkos dari baffle. Kecil pada 90° (+50 Pa dari polos), terbesar pada 45° (4.300 Pa). Sumbu dimulai dari 3.800 Pa supaya selisihnya terlihat.'],
        ratio: ['Efektivitas ÷ pressure drop', 'Keseimbangan yang saya cari. 90° unggul: efektivitas paling tinggi untuk setiap pascal pressure drop.'],
        u: ['Koefisien perpindahan kalor keseluruhan, U', 'Naik hampir dua kali lipat begitu baffle dipasang, dan hampir sama untuk setiap sudut.'],
        area: ['Luas perpindahan kalor', 'Makin landai sudutnya, makin jauh baffle menjangkau, sehingga luasnya naik dari 0,11 ke 0,25 m².'],
        lmtd: ['Beda temperatur rata-rata logaritmik', 'Turun saat makin banyak kalor berpindah, karena temperatur keluar kedua sisi makin dekat. Sumbu dimulai dari 30 °C.'],
        qloss: ['Kalor yang hilang ke ruangan', 'Tertinggi pada 60° (1,68 kJ/s). Turbulensi lebih besar mendorong lebih banyak kalor ke dinding luar, jadi heat exchanger dengan baffle butuh insulasi lebih tebal.'],
        tins: ['Temperatur permukaan insulasi', 'Rata-rata 4 titik di sepanjang shell. Mengikuti kalor yang hilang: paling hangat pada 60° (37,7 °C). Sumbu dimulai dari 30 °C.']
      },
      best: 'terbaik', note: 'Rata-rata 3 kali pengujian. Panas 80 °C, 4 L/menit; dingin 30 °C, 8,5 L/menit.'
    },

    l: {
      verdict: 'Jawabannya: 90°.',
      verdictBody: 'Baffle bersudut 90° menggandakan efektivitas heat exchanger dari 10% menjadi 20%, dan menaikkan kalor yang benar-benar diterima air dingin dari 1,30 menjadi 2,77 kJ/s, dengan tambahan pressure drop hanya 50 Pa. Sudut yang lebih landai memberi permukaan lebih luas, tapi tidak menambah kalor yang berguna, dan pressure drop-nya lebih besar.',
      learnedTitle: 'Yang membuat saya terkejut',
      learned: [
        'Luas yang lebih besar tidak berarti kalor berguna lebih banyak. Pada 60° dan 45° sisi panas melepas lebih banyak kalor, tapi sisi dingin justru menerima lebih sedikit: lamanya air bersentuhan sama pentingnya dengan luas permukaan.',
        'Pada dua variasi, sisi dingin menerima kalor lebih banyak daripada yang dilepas sisi panas. Secara fisik itu tidak mungkin, jadi saya laporkan sebagai anomali, kemungkinan dari ketelitian instrumen atau pembacaan sebelum alat benar-benar steady.',
        'Baffle mengaduk aliran dan mendorong kalor ke dinding luar. Heat exchanger dengan baffle butuh insulasi lebih tebal daripada yang polos.'
      ],
      nextTitle: 'Yang akan saya lakukan berikutnya',
      next: [
        'Mencatat temperatur setiap detik dengan microcontroller, bukan membaca display secara manual.',
        'Mengukur temperatur insulasi di lebih dari empat titik, dan menghitung konveksi ke ruangan.',
        'Meneliti tekanan masuk yang tidak stabil di sisi annulus (water hammer).',
        'Mengecek sisi mekanikalnya juga: shell terhadap ASME Section VIII dan pipa panas terhadap pemuaian termal (ASME B31).'
      ]
    }
  }
};
