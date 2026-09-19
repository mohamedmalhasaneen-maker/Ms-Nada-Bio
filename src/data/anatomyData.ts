import { AnatomicalItem, QuizQuestion } from '../types';
import { skeletalSystem, muscularSystem, nervousSystem } from './biologyData';

export const ANATOMICAL_ITEMS: Record<string, AnatomicalItem> = {
  // ==========================================
  // الهيكل العظمي (SKELETAL SYSTEM)
  // ==========================================
  'skull': {
    id: 'skull',
    system: 'skeletal',
    nameAr: 'الجمجمة وقحف الرأس',
    nameEn: 'Cranium & Facial Bones',
    latinName: 'Cranium',
    region: 'head',
    regionAr: 'الرأس والعنق',
    color: '#f8f5eb',
    functionAr: 'حماية الدماغ والأعضاء الحسية الحيوية (العينين والأذنين ومستقبلات الشم)، وتوفير البنية التأسيسية لملامح الوجه وتثبيت الأسنان.',
    clinicalNotesAr: 'تتكون جمجمة البالغين من 22 عظمة ملتحمة بواسطة دروز غير متحركة باستثناء الفك السفلي. عند الولادة، توجد اليافوخات (Fontanelles) لتسهيل الولادة ونمو الدماغ.',
    factsAr: [
      'تعتبر عظام القحف شديدة الصلابة وتتحمل ضغطاً هائلاً لحماية النسيج العصبي الحساس.',
      'تزن جمجمة الإنسان البالغ حوالي 1 كيلوغرام في المتوسط.',
      'عظمة الفك السفلي هي العظمة الوحيدة المتحركة في الجمجمة.'
    ],
    compositionAr: 'عظام مسطحة وغير منتظمة، غنية بفوسفات الكالسيوم والكولاجين',
    cameraTarget: [0, 5.8, 0],
    cameraPosition: [0, 5.8, 4.5]
  },
  'mandible': {
    id: 'mandible',
    system: 'skeletal',
    nameAr: 'الفك السفلي',
    nameEn: 'Mandible',
    latinName: 'Mandibula',
    region: 'head',
    regionAr: 'الرأس والعنق',
    color: '#eae5d8',
    functionAr: 'حمل الأسنان السفلية والمشاركة الفعالة في عملية المضغ والكلام وفتح وغلق الفم عبر المفصل الصدغي الفكي (TMJ).',
    clinicalNotesAr: 'أقوى وأكبر عظمة في وجه الإنسان. قد يتعرض المفصل الصدغي الفكي لخلل وظيفي (TMJ disorder) يسبب ألماً أثناء المضغ.',
    factsAr: [
      'ترتبط بها أقوى عضلات الجسم نسبة لحجمها وهي العضلة الماضغة (Masseter).',
      'تتصل بالجمجمة بمفصل لقمي زلالي فريد يتحرك في عدة محاور.'
    ],
    compositionAr: 'عظم قشري مدمج فائق القوة',
    cameraTarget: [0, 5.3, 0.4],
    cameraPosition: [0, 5.3, 3.5]
  },
  'spine_cervical': {
    id: 'spine_cervical',
    system: 'skeletal',
    nameAr: 'الفقرات العنقية',
    nameEn: 'Cervical Vertebrae (C1-C7)',
    latinName: 'Vertebrae Cervicales',
    region: 'head',
    regionAr: 'الرأس والعنق',
    color: '#f0ece1',
    functionAr: 'دعم وزن الرأس والسماح بمدى حركي واسع (الدوران، الإمالة، الانثناء)، مع حماية الجزء العلوي من الحبل الشوكي والشرايين الفقرية.',
    clinicalNotesAr: 'الفقرة الأولى تسمى الفهقة (Atlas) والثانية المحور (Axis)، وتتيحان دوران الرأس كأنك تقول "لا". شائعة التأثر بإجهاد الشاشات (Text Neck).',
    factsAr: [
      'تمتلك جميع الثدييات (بما فيها الزرافة) 7 فقرات عنقية كالإنسان تماماً.',
      'القرص الغضروفي بين الفقرات يمتص الصدمات اليومية بكفاءة.'
    ],
    compositionAr: 'عظم إسفنجي محاط بطبقة مدمجة وغضاريف ليفية',
    cameraTarget: [0, 4.7, 0],
    cameraPosition: [0, 4.7, 3.5]
  },
  'spine_thoracic_lumbar': {
    id: 'spine_thoracic_lumbar',
    system: 'skeletal',
    nameAr: 'العمود الفقري الصدري والقطني',
    nameEn: 'Thoracic & Lumbar Spine',
    latinName: 'Columna Vertebralis',
    region: 'torso',
    regionAr: 'الجذع والظهر',
    color: '#ece6d8',
    functionAr: 'المحور الداعم للجسم، توزيع ثقل الجذع على الحوض، وحماية النخاع الشوكي الممتد في قناته الفقرية.',
    clinicalNotesAr: 'الفقرات القطنية (L1-L5) هي الأكبر والأسمك لأنها تتحمل معظم وزن الجسم. الانزلاق الغضروفي (Herniated Disc) يحدث غالباً بين L4-L5 أو L5-S1.',
    factsAr: [
      'العمود الفقري يمتلك 4 انحناءات طبيعية تعطيه مرونة تشبه الزنبرك لامتصاص الصدمات أثناء الركض والقفز.',
      'يكون الإنسان أطول بحوالي 1 إلى 2 سم في الصباح بسبب تمدد الأقراص الغضروفية بالماء أثناء النوم.'
    ],
    compositionAr: '24 فقرة حرة بالإضافة إلى العجز والعصعص الملتحمة',
    cameraTarget: [0, 2.5, 0],
    cameraPosition: [0, 2.5, 5.0]
  },
  'ribcage_sternum': {
    id: 'ribcage_sternum',
    system: 'skeletal',
    nameAr: 'القفص الصدري وعظم القص',
    nameEn: 'Rib Cage & Sternum',
    latinName: 'Cavea Thoracis et Sternum',
    region: 'torso',
    regionAr: 'الجذع والصدر',
    color: '#f4efe4',
    functionAr: 'حماية القلب والرئتين والأوعية الدموية الكبرى، وتسهيل عملية التنفس من خلال التمدد والتقلص بمساعدة عضلات الورب والحجاب الحاجز.',
    clinicalNotesAr: 'يتكون من 12 زوجاً من الأضلاع: 7 أزواج حقيقية تتصل مباشرة بالقص، 3 كاذبة تتصل عبر غضروف، وزوجان سائبان (Floating ribs) غير متصلين بالقص.',
    factsAr: [
      'يتمدد القفص الصدري أكثر من 20,000 مرة يومياً أثناء التنفس العادي.',
      'عظم القص هو موضع إجراء عمليات أخذ عينات نخاع العظم أو فتح الصدر في جراحات القلب.'
    ],
    compositionAr: 'أضلاع عظمية مرنة متصلة بغضاريف ضلعية زجاجية متينة',
    cameraTarget: [0, 3.4, 0],
    cameraPosition: [0, 3.4, 4.2]
  },
  'pelvis': {
    id: 'pelvis',
    system: 'skeletal',
    nameAr: 'عظام الحوض والزنار الحوضي',
    nameEn: 'Pelvic Girdle',
    latinName: 'Pelvis',
    region: 'torso',
    regionAr: 'الحوض وقاعدة الجذع',
    color: '#e8e2d4',
    functionAr: 'ربط العمود الفقري بالأطراف السفلية، نقل وزن الجزء العلوي من الجسم للأرجل، وحماية أعضاء التكاثر والمثانة والأمعاء السفلية.',
    clinicalNotesAr: 'يختلف حوض الأنثى عن حوض الذكر بكونه أوسع وأخف وزناً ومدخله أكثر بيضاوية ليسمح بعملية الحمل والولادة الطبيعية.',
    factsAr: [
      'يتكون حوض البالغ من اندماج ثلاثة عظام: الحرقفة (Ilium)، الإسك (Ischium)، والعانة (Pubis).',
      'يحتوي الحوض على الحُق (Acetabulum)، وهو تجويف عميق يستقبل رأس عظم الفخذ بقوة متناهية.'
    ],
    compositionAr: 'عظام قوية كثيفة تدعم استقامة المشي البشري على قدمين',
    cameraTarget: [0, 1.2, 0],
    cameraPosition: [0, 1.2, 4.0]
  },
  'clavicle_scapula': {
    id: 'clavicle_scapula',
    system: 'skeletal',
    nameAr: 'عظم الترقوة ولوح الكتف',
    nameEn: 'Clavicle & Scapula (Pectoral Girdle)',
    latinName: 'Clavicula et Scapula',
    region: 'upper_limbs',
    regionAr: 'الطرف العلوي والكتف',
    color: '#f2ece0',
    functionAr: 'توصيل الذراع بالجذع، وتوفير قاعدة حركية مرنة جداً تسمح للكتف بحرية حركة 360 درجة، وهي أوسع مدى حركي في المفاصل.',
    clinicalNotesAr: 'عظم الترقوة من أكثر العظام تعرضاً للكسر في جسم الإنسان، خصوصاً عند السقوط على الكتف أو اليد الممدودة.',
    factsAr: [
      'الترقوة هي العظمة الأفقية الطويلة الوحيدة في جسم الإنسان.',
      'لوح الكتف عظمة مثلثة مسطحة تطفو على الجدار الخلفي للصدر وتتثبت بالعضلات فقط.'
    ],
    compositionAr: 'عظم ترقوي إسفنجي قشري مع لوح كتفي مسطح',
    cameraTarget: [0, 4.0, 0.2],
    cameraPosition: [0, 4.0, 3.8]
  },
  'humerus': {
    id: 'humerus',
    system: 'skeletal',
    nameAr: 'عظم العضد',
    nameEn: 'Humerus',
    latinName: 'Humerus',
    region: 'upper_limbs',
    regionAr: 'الذراع العلوي',
    color: '#eee8dc',
    functionAr: 'تكوين هيكل الذراع العلوي، التمفصل مع لوح الكتف في المفصل الحقاني العضدي، ومع الكعبرة والزند في مفصل المرفق.',
    clinicalNotesAr: 'يمر العصب الكعبري في الأخدود الحلزوني لعظم العضد؛ لذلك قد يؤدي كسر منتصف العضد لشلل عضلات بسط الرسغ (سقوط اليد).',
    factsAr: [
      'يُعرف النتوء الداخلي للمرفق بالعظمة المضحكة (Funny bone) نظراً لتجاورها مع العصب الزندي الحساس للمس.',
      'ترتبط به عضلات قوية مثل العضلة الدالية وعضلات الصدر والظهر.'
    ],
    compositionAr: 'عظم طويل أسطواني بقمة كروية وقاعدة بكرية معقدة',
    cameraTarget: [-1.8, 3.0, 0],
    cameraPosition: [-2.2, 3.0, 3.5]
  },
  'forearm_bones': {
    id: 'forearm_bones',
    system: 'skeletal',
    nameAr: 'عظمتا الساعد (الكعبرة والزند)',
    nameEn: 'Radius & Ulna',
    latinName: 'Radius et Ulna',
    region: 'upper_limbs',
    regionAr: 'الطرف العلوي والساعد',
    color: '#e7e1d2',
    functionAr: 'تشكيل الساعد والسماح بحركة كب وبسط اليد (Pronation & Supination) عبر دوران الكعبرة حول عظم الزند الثابت.',
    clinicalNotesAr: 'كسر كوليس (Colles\' Fracture) في النهاية السفلية للكعبرة شائع جداً لدى كبار السن عند السقوط.',
    factsAr: [
      'الكعبرة تقع جهة الإبهام وتكون أوسع عند المعصم، بينما الزند جهة الخنصر وأوسع عند المرفق.',
      'الحركة المحورية بين العظمتين هي ما يتيح للإنسان قلب راحة يده لأعلى ولأسفل.'
    ],
    compositionAr: 'عظمان متوازيان متصلان بغشاء بين عظمي ليفي قوي',
    cameraTarget: [-2.5, 1.8, 0],
    cameraPosition: [-2.5, 1.8, 3.0]
  },
  'hand_bones': {
    id: 'hand_bones',
    system: 'skeletal',
    nameAr: 'عظام اليد والأمشاط والسلاميات',
    nameEn: 'Carpals, Metacarpals & Phalanges',
    latinName: 'Ossa Manus',
    region: 'upper_limbs',
    regionAr: 'اليد والرسغ',
    color: '#f5f0e3',
    functionAr: 'تنفيذ أدق الحركات الميكانيكية الماهرة، كالكتابة والعزف والقبض واللمس الدقيق، بفضل مرونة 27 عظمة في كل يد.',
    clinicalNotesAr: 'متلازمة النفق الرسغي (Carpal Tunnel Syndrome) تنتج عن انضغاط العصب الناصف أثناء مروره تحت القيد القابض لعظام الرسغ.',
    factsAr: [
      'تمثل عظام اليدين والقدمين معاً أكثر من نصف عدد عظام جسم الإنسان البالغ (106 من أصل 206)!',
      'الإبهام البشري القابل للمقابلة هو سر قدرة الإنسان على استخدام الأدوات بدقة لا تضاهى.'
    ],
    compositionAr: '8 عظام رسغية، 5 أمشاط، و 14 سلامية في الأصابع',
    cameraTarget: [-2.8, 0.8, 0],
    cameraPosition: [-2.8, 0.8, 2.5]
  },
  'femur': {
    id: 'femur',
    system: 'skeletal',
    nameAr: 'عظم الفخذ',
    nameEn: 'Femur',
    latinName: 'Femur',
    region: 'lower_limbs',
    regionAr: 'الطرف السفلي',
    color: '#ece5d7',
    functionAr: 'تحمل الوزن الهائل للجسم أثناء الوقوف والجري والقفز، ونقل القوى الميكانيكية من الحوض إلى مفصل الركبة.',
    clinicalNotesAr: 'أطول وأثقل وأقوى عظم في الهيكل العظمي، ويتحمل قوى ضغط تصل إلى 30 ضعف وزن الجسم تقريباً.',
    factsAr: [
      'يمثل طول عظم الفخذ حوالي ربع طول الإنسان البالغ بدقة مذهلة.',
      'رأس الفخذ كروي أملس مغطى بطبقة سميكة من الغضروف الزلالي لحركة انسيابية تامة.'
    ],
    compositionAr: 'عظم قشري فائق الكثافة بنخاع عظمي نشط غني بالخلايا الجذعية',
    cameraTarget: [-0.9, -0.6, 0],
    cameraPosition: [-0.9, -0.6, 3.6]
  },
  'patella': {
    id: 'patella',
    system: 'skeletal',
    nameAr: 'الرضفة (صابونة الركبة)',
    nameEn: 'Patella',
    latinName: 'Patella',
    region: 'lower_limbs',
    regionAr: 'مفصل الركبة',
    color: '#eae3d5',
    functionAr: 'حماية مفصل الركبة الأمامي، وزيادة الرافعة الميكانيكية لوتر العضلة رباعية الرؤوس بنسبة تزيد عن 30% أثناء بسط الركبة.',
    clinicalNotesAr: 'أكبر عظمة سمسمية (Sesamoid bone) في الجسم، مدمجة داخل وتر العضلة الفخذية الرباعية لتقليل الاحتكاك.',
    factsAr: [
      'يولد الأطفال بدون عظمة رضفة صلبة، بل تتكون كغضروف يتكلس تدريجياً بين عمر 2 و 6 سنوات.',
      'السطح الخلفي للرضفة يمتلك أسمك طبقة غضروف مفصلي في جسم الإنسان (حوالي 6 ملم).'
    ],
    compositionAr: 'عظم سمسمي قوي ذو وجه مفصلي أملس وغضروف سميك',
    cameraTarget: [0, -1.8, 0.4],
    cameraPosition: [0, -1.8, 2.8]
  },
  'tibia_fibula': {
    id: 'tibia_fibula',
    system: 'skeletal',
    nameAr: 'عظمتا الساق (القصبة والشظية)',
    nameEn: 'Tibia & Fibula',
    latinName: 'Tibia et Fibula',
    region: 'lower_limbs',
    regionAr: 'الساق والقدم',
    color: '#e7e0d1',
    functionAr: 'القصبة هي العظمة الحاملة للوزن الأساسي في الساق، بينما تعمل الشظية كنقطة ارتكاز وتثبيت للعضلات وتشكيل كاحل القدم الخارجي.',
    clinicalNotesAr: 'القصبة ثاني أطول عظمة بعد الفخذ، وتقع حافتها الأمامية تحت الجلد مباشرة دون غطاء عضلي، مما يجعلها حساسة للصدمات.',
    factsAr: [
      'الشظية لا تتحمل سوى حوالي 10% إلى 15% من وزن الجسم، ويمكن أحياناً استخدام أجزاء منها في جراحات الترقيع العظمي.',
      'يشكل النتوءان السفليان للقصبة والشظية الكاحلين الداخلي والخارجي (Malleoli).'
    ],
    compositionAr: 'عظام أنبوبية قوية تتصل بغشاء بين عظمي ليفي متين',
    cameraTarget: [-0.9, -3.2, 0],
    cameraPosition: [-0.9, -3.2, 3.8]
  },
  'foot_bones': {
    id: 'foot_bones',
    system: 'skeletal',
    nameAr: 'عظام القدم والكاحل والأصابع',
    nameEn: 'Tarsals, Metatarsals & Phalanges',
    latinName: 'Ossa Pedis',
    region: 'lower_limbs',
    regionAr: 'القدم',
    color: '#f0ebd8',
    functionAr: 'امتصاص الصدمات أثناء المشي وتوفير قاعدة استناد قوية تشكل الأقواس الطبيعية للقدم الدافعة للأمام.',
    clinicalNotesAr: 'تسطح القدم (Flatfoot) يحدث نتيجة هبوط القوس الطولي الإنسي، مما قد يؤدي لإجهاد عضلي وألم في الركبة وأسفل الظهر.',
    factsAr: [
      'عظم العقب (Calcaneus) هو أكبر عظم في القدم ويرتبط به وتر أخيل المشهور، أقوى وتر في جسم الإنسان.',
      'تحتوي القدم الواحدة على 26 عظمة و 33 مفصلاً وأكثر من 100 رباط ووتر.'
    ],
    compositionAr: 'عظام كاحل متراصة هندسياً تدعم أوزان تعادل أضعاف الجسم',
    cameraTarget: [-0.9, -4.6, 0.4],
    cameraPosition: [-0.9, -4.6, 2.5]
  },

  // ==========================================
  // الجهاز العضلي (MUSCULAR SYSTEM) - الأطلس العضلي الشامل
  // ==========================================

  // 1. عضلات الرأس والرقبة (Head & Neck Muscles)
  'masseter': {
    id: 'masseter',
    system: 'muscular',
    nameAr: 'العضلة الماضغة (الملاغية)',
    nameEn: 'Masseter Muscle',
    latinName: 'Musculus Masseter',
    region: 'head',
    regionAr: 'الرأس والفك',
    color: '#e11d48',
    anatomicalLocationAr: 'الفك السفلي (تمتد من القوس الوجني إلى زاوية والسطح الوحشي لفرع الفك السفلي)',
    primaryFunctionAr: 'المضغ وإغلاق الفك السفلي ورفع الأسنان السفلية بقوة لسحق الطعام',
    functionAr: 'تعتبر أقوى عضلة في جسم الإنسان قياساً بكتلتها؛ حيث تقوم برفع الفك السفلي بقوة هائلة تطبق قوى إطباق تصل لأكثر من 90 كيلوغراماً.',
    clinicalNotesAr: 'تتضخم العضلة في حالات صرير الأسنان أثناء النوم (Bruxism) أو مضغ اللبان المفرط، ويمكن علاج فرط نشاطها بحقن البوتوكس لتخفيف إجهاد المفصل الصدغي الفكي.',
    factsAr: [
      'دخلت موسوعة غينيس للأرقام القياسية كأقوى عضلة نسبة لحجمها وكتلتها في جسم الكائن الحي.',
      'يغذيها العصب الماضغي المتفرع من العصب ثلاثي التوائم (العصب القحفي الخامس CN V3).'
    ],
    movementOrPathwayAr: 'رفع وإغلاق الفك السفلي مع حركة إطباقية وطحن للطعام',
    primaryView: 'lateral',
    cameraTarget: [0.18, 1.88, 0.18],
    cameraPosition: [1.2, 1.88, 2.0]
  },
  'temporalis': {
    id: 'temporalis',
    system: 'muscular',
    nameAr: 'العضلة الصدغية',
    nameEn: 'Temporalis Muscle',
    latinName: 'Musculus Temporalis',
    region: 'head',
    regionAr: 'جانب الجمجمة',
    color: '#be123c',
    anatomicalLocationAr: 'جانب الجمجمة (الحفرة الصدغية ممتدة حتى النتوء المنقاري للفك السفلي)',
    primaryFunctionAr: 'رفع الفك السفلي وسحبه للخلف (Retraction) لإحكام إغلاق الفم',
    functionAr: 'عضلة مروحية عريضة تغطي الصدغين، ترفع الفك السفلي بقوة وتعمل على سحبه إلى الخلف لتأمين إطباق الأسنان الدقيق.',
    clinicalNotesAr: 'انقباضها المفرط هو السبب الرئيسي لصداع التوتر الصدغي (Tension Headache). يمكنك تحسس نبض أليافها بسهولة بوضع أصابعك على صدغيك وإطباق أسنانك.',
    factsAr: [
      'تمر أوتارها القوية تحت القوس الوجني مباشرة كبكرة حركية متقنة.',
      'تتآزر بشكل وثيق مع العضلة الماضغة لتوليد حركات المضغ السريعة والمنسقة.'
    ],
    movementOrPathwayAr: 'رفع الفك وسحبه للخلف والتثبيت أثناء المضغ',
    primaryView: 'lateral',
    cameraTarget: [0.28, 2.05, 0.08],
    cameraPosition: [1.3, 2.05, 1.8]
  },
  'sternocleidomastoid': {
    id: 'sternocleidomastoid',
    system: 'muscular',
    nameAr: 'العضلة القسية الترقوية الثديية (SCM)',
    nameEn: 'Sternocleidomastoid Muscle',
    latinName: 'Musculus Sternocleidomastoideus',
    region: 'head',
    regionAr: 'جانب الرقبة والعنق',
    color: '#fb7185',
    anatomicalLocationAr: 'جانب الرقبة (من عظم القص والترقوة صعوداً إلى النتوء الحلمي خلف الأذن)',
    primaryFunctionAr: 'تدوير الرأس إلى الجانب المعاكس وإمالة الرقبة وثني العنق للأمام',
    functionAr: 'المحرك الأساسي لحركات الرأس المحورية؛ عند انقباضها في جانب واحد تدير الرأس للجهة المقابلة، وعند انقباض الجهتين معاً تثني الرأس للأمام وتساعد في الشهيق الإجباري.',
    clinicalNotesAr: 'قد تصاب بالتشنج الخلقي أو المكتسب مسببة حالة الصعر (Torticollis / المَيَلان العنقي). كما تمثل معلماً تشريحياً هاماً لتحديد مسار الشريان السباتي الأصلي.',
    factsAr: [
      'تعتبر العضلة الوحيدة في الرقبة التي يغذيها عصب قحفي منشؤه جذع الدماغ (العصب القحفي الحادي عشر XI).',
      'تعد نقطة علامة رئيسية لتقسيم مثلثات العنق التشريحية في الجراحة العامة.'
    ],
    movementOrPathwayAr: 'تدوير الرأس قطرياً، إمالة العنق، ورفع القفص الصدري أثناء الشهيق العميق',
    primaryView: 'anterior',
    cameraTarget: [0.16, 1.62, 0.14],
    cameraPosition: [0.8, 1.62, 2.2]
  },

  // 2. عضلات الصدر والكتف (Chest & Shoulder Muscles)
  'pectoralis_major': {
    id: 'pectoralis_major',
    system: 'muscular',
    nameAr: 'العضلة الصدرية الكبرى والصغرى',
    nameEn: 'Pectoralis Major & Minor',
    latinName: 'Musculi Pectorales (Major et Minor)',
    region: 'torso',
    regionAr: 'جدار الصدر الأمامي',
    color: '#b93b3b',
    anatomicalLocationAr: 'جدار الصدر الأمامي (من الترقوة، عظم القص، وغضاريف الأضلاع حتى عظم العضد)',
    primaryFunctionAr: 'تقريب ورفع الذراع نحو الداخل وتدويره إنسياً مع خفض لوح الكتف',
    functionAr: 'توليد القوة الدافعة الأمامية للأطراف العلوية في حركات الدفع والاحتضان، والتحكم بمحور عظم العضد عبر مفصل الكتف ورفع الأضلاع أثناء الشهيق العميق.',
    clinicalNotesAr: 'تتعرض لتمزقات وترية حادة أثناء تمرين الضغط بالبار الثقيل (Bench Press). العضلة الصدرية الصغرى تقع تحتها وتثبت لوح الكتف.',
    factsAr: [
      'تتخذ أليافها شكلاً مروحياً ثنائي الحزم (رأس ترقوي ورأس قصي ضلعي).',
      'يغذيها العصب الصدري الإنسي والوحشي الناشئان من الضفيرة العضدية.'
    ],
    movementOrPathwayAr: 'تقريب العضد، التدوير الداخلي، وثني مفصل الكتف',
    primaryView: 'anterior',
    cameraTarget: [0.22, 1.15, 0.26],
    cameraPosition: [0, 1.15, 2.6]
  },
  'deltoid': {
    id: 'deltoid',
    system: 'muscular',
    nameAr: 'العضلة الدالية (عضلة الكتف)',
    nameEn: 'Deltoid Muscle',
    latinName: 'Musculus Deltoideus',
    region: 'upper_limbs',
    regionAr: 'قمة الكتف',
    color: '#c24141',
    anatomicalLocationAr: 'قمة الكتف (تغطي مفصل الكتف من الترقوة والأخرم وشوكة لوح الكتف حتى أحدوبة العضد)',
    primaryFunctionAr: 'رفع وإبعاد الذراع إلى الجانب (Abduction) ومساعدة ثني وبسط وتدوير الذراع',
    functionAr: 'عضلة ثلاثية الفصوص (أمامية، وسطى، وخلفية) مسؤولة عن إبعاد الذراع عن الجذع من زاوية 15 إلى 90 درجة، وتوليد توازن واستقرار لمفصل الكتف الكروي.',
    clinicalNotesAr: 'تعتبر الموقع الأكثر تفضيلاً للحقن العضلي (IM Injections) للتطعيمات لسهولة الوصول إليها وترويتها الدموية الغنية وتجنب الأعصاب الرئيسية.',
    factsAr: [
      'سميت بالدالية لتطابق شكلها الهندسي مع حرف الدلتا الإغريقي (Δ).',
      'يغذيها العصب الإبطي (Axillary Nerve) الذي يلتف حول عنق عظم العضد الجراحي.'
    ],
    movementOrPathwayAr: 'تبعيد وثني وبسط الذراع وتثبيت مفصل الكتف',
    primaryView: 'lateral',
    cameraTarget: [0.52, 1.32, 0.06],
    cameraPosition: [1.8, 1.32, 1.6]
  },
  'rotator_cuff': {
    id: 'rotator_cuff',
    system: 'muscular',
    nameAr: 'الكفة المدورة (مجموعة عضلات الكتف العميقة)',
    nameEn: 'Rotator Cuff Muscle Group (SITS)',
    latinName: 'Musculi Rotatores Humeri',
    region: 'upper_limbs',
    regionAr: 'حول مفصل الكتف',
    color: '#e11d48',
    anatomicalLocationAr: 'حول مفصل الكتف (ممتدة من لوح الكتف ومحيطة برأس عظم العضد)',
    primaryFunctionAr: 'تثبيت مفصل الكتف وتدوير الذراع وتأمين رأس العضد داخل التجويف الحقاني',
    functionAr: 'تتكون من 4 عضلات حيوية (فوق الشوكة، تحت الشوكة، المدورة الصغيرة، وتحت اللوح - SITS). تعمل كحزام عضلي ديناميكي يمنع خلع الكتف أثناء الحركات العنيفة.',
    clinicalNotesAr: 'تمزق أوتار الكفة المدورة (خاصة وتر فوق الشوكة Supraspinatus) من أكثر إصابات الكتف شيوعاً بين الرياضيين وكبار السن مسببة ألماً حاداً عند رفع الذراع جانباً.',
    factsAr: [
      'بدون الكفة المدورة، تنفصل عظمة العضد عن تجويفها الحقاني بمجرد سحب الذراع بقوة.',
      'تتميز أوتارها باندماجها المباشر مع المحفظة الليفية لمفصل الكتف الزلالي.'
    ],
    movementOrPathwayAr: 'تدوير العضد داخلياً وخارجياً وتثبيت الرأس المفصلي',
    primaryView: 'posterior',
    cameraTarget: [0.44, 1.28, -0.16],
    cameraPosition: [1.2, 1.28, -2.4]
  },

  // 3. عضلات الذراعين والساعد (Arms & Forearm Muscles)
  'biceps': {
    id: 'biceps',
    system: 'muscular',
    nameAr: 'العضلة ذات الرأسين العضدية (البايسبس)',
    nameEn: 'Biceps Brachii',
    latinName: 'Musculus Biceps Brachii',
    region: 'upper_limbs',
    regionAr: 'مقدمة الذراع',
    color: '#b83232',
    anatomicalLocationAr: 'مقدمة الذراع (الحجرة الأمامية للعضد ممتدة من لوح الكتف حتى عظم الكعبرة)',
    primaryFunctionAr: 'ثني المرفق وتدوير الساعد للخارج (بطح اليد / Supination)',
    functionAr: 'المحرك الأقوى لثني مفصل المرفق وبطح الساعد (توجيه راحة اليد لأعلى) ومساعدة ثني مفصل الكتف، ومحرك رئيسي عند فتح الأبواب والبراغي.',
    clinicalNotesAr: 'يمر وتر الرأس الطويل للبايسبس داخل محفظة مفصل الكتف في الأخدود بين الحديبتين، وهو عرضة للالتهاب المزمن والانقطاع الوتر (علامة باباي Popeye Deformity).',
    factsAr: [
      'تعتبر العضلة الباسطة لليد للخارج أقوى بكثير عندما يكون المرفق مثنياً بزاوية 90 درجة.',
      'يغذيها العصب العضلي الجلدي (Musculocutaneous Nerve).'
    ],
    movementOrPathwayAr: 'ثني المرفق وبطح الساعد وتثبيت رأس العضد',
    primaryView: 'anterior',
    cameraTarget: [0.62, 0.85, 0.12],
    cameraPosition: [1.5, 0.85, 2.2]
  },
  'biceps_brachii': {
    id: 'biceps_brachii',
    system: 'muscular',
    nameAr: 'العضلة ذات الرأسين العضدية (البايسبس)',
    nameEn: 'Biceps Brachii',
    latinName: 'Musculus Biceps Brachii',
    region: 'upper_limbs',
    regionAr: 'مقدمة الذراع',
    color: '#b83232',
    anatomicalLocationAr: 'مقدمة الذراع (الحجرة الأمامية للعضد ممتدة من لوح الكتف حتى عظم الكعبرة)',
    primaryFunctionAr: 'ثني المرفق وتدوير الساعد للخارج (بطح اليد / Supination)',
    functionAr: 'المحرك الأقوى لثني مفصل المرفق وبطح الساعد ومساعدة ثني مفصل الكتف.',
    clinicalNotesAr: 'عرضة لالتهاب الوتر التوتري وانقطاع الرأس الطويل.',
    factsAr: ['يغذيها العصب العضلي الجلدي.'],
    movementOrPathwayAr: 'ثني المرفق وبطح الساعد',
    primaryView: 'anterior',
    cameraTarget: [0.62, 0.85, 0.12],
    cameraPosition: [1.5, 0.85, 2.2]
  },
  'triceps': {
    id: 'triceps',
    system: 'muscular',
    nameAr: 'العضلة ذات الثلاثة رؤوس العضدية (الترايسبس)',
    nameEn: 'Triceps Brachii',
    latinName: 'Musculus Triceps Brachii',
    region: 'upper_limbs',
    regionAr: 'خلف الذراع',
    color: '#a82c2c',
    anatomicalLocationAr: 'خلف الذراع (الحجرة الخلفية للعضد حتى نتوء الزج في عظم الزند)',
    primaryFunctionAr: 'بسط مفصل المرفق ودفع الساعد للاستقامة ومقاومة قوى الثني',
    functionAr: 'العضلة الباسطة الوحيدة لمفصل المرفق، حيث تسحب الزج لاستقامة الطرف بالكامل وتلعب دوراً محورياً في حركات الدفع والرمي ورفع الأثقال.',
    clinicalNotesAr: 'تمتلك ثلاثة رؤوس: الرأس الطويل (من لوح الكتف)، والوحشي والإنسي (من عظم العضد). شلل العصب الكعبري يفقد الذراع القدرة على بسط المرفق والمعصم.',
    factsAr: [
      'تشكل العضلة ثلاثية الرؤوس حوالي 60% من الحجم الكلي لعضلات الذراع العلوي.',
      'يغذيها العصب الكعبري الممتد في الأخدود الحلزوني لعظم العضد.'
    ],
    movementOrPathwayAr: 'بسط مفصل المرفق ومساعدة بسط وتقريب الكتف',
    primaryView: 'posterior',
    cameraTarget: [-0.62, 0.85, -0.14],
    cameraPosition: [-1.5, 0.85, -2.4]
  },
  'triceps_brachii': {
    id: 'triceps_brachii',
    system: 'muscular',
    nameAr: 'العضلة ثلاثية الرؤوس العضدية',
    nameEn: 'Triceps Brachii',
    latinName: 'Musculus Triceps Brachii',
    region: 'upper_limbs',
    regionAr: 'خلف الذراع',
    color: '#a82c2c',
    anatomicalLocationAr: 'خلف الذراع (الحجرة الخلفية للعضد)',
    primaryFunctionAr: 'بسط مفصل المرفق ودفع الساعد للاستقامة',
    functionAr: 'الباسطة الرئيسية لمفصل المرفق.',
    clinicalNotesAr: 'شائعة الاستخدام في حركات الدفع.',
    factsAr: ['تشكل الجزء الأكبر من حجم الذراع.'],
    movementOrPathwayAr: 'بسط المرفق',
    primaryView: 'posterior',
    cameraTarget: [-0.62, 0.85, -0.14],
    cameraPosition: [-1.5, 0.85, -2.4]
  },
  'forearm_muscles': {
    id: 'forearm_muscles',
    system: 'muscular',
    nameAr: 'عضلات الساعد الباسطة والقابضة',
    nameEn: 'Forearm Flexors & Extensors',
    latinName: 'Musculi Antebrachii (Flexores et Extensores)',
    region: 'upper_limbs',
    regionAr: 'منطقة الساعد',
    color: '#f43f5e',
    anatomicalLocationAr: 'الساعد (تحيط بعظمي الكعبرة والزند ممتدة بأوتار رفيعة إلى اليد والأصابع)',
    primaryFunctionAr: 'تحريك وميلان وثني وبسط المعصم، والتحكم بقبضة اليد وحركات الأصابع الدقيقة',
    functionAr: 'شبكة عضلية معقدة تضم أكثر من 19 عضلة مقسمة لحجرتين؛ أمامية (قابضة للمعصم والأصابع وكابة للساعد)، وخلفية (باسطة للمعصم والأصابع وباطحة للساعد).',
    clinicalNotesAr: 'التهاب أوتار الباسطات عند لقيمة العضد الوحشية يسبب "مرفق لاعب التنس" (Tennis Elbow)، بينما التهاب القابضات يسبب "مرفق لاعب الجولف" (Golfer\'s Elbow). متلازمة نفق الرسغ تضغط على العصب الأوسط المار بين أوتارها.',
    factsAr: [
      'عضلات أصابع اليد توجد أساساً في الساعد وليس في الأصابع نفسها، وتتصل بالأصابع عبر أوتار انزلاقية طويلة تمر في أغمدة زلالية محكمة.',
      'تمنح الإنسان قبضة القوة (Power Grip) وقبضة الدقة (Precision Grip).'
    ],
    movementOrPathwayAr: 'ثني وبسط المعصم وحركات الأصابع والكب والبطح',
    primaryView: 'anterior',
    cameraTarget: [0.82, 0.25, 0.08],
    cameraPosition: [1.8, 0.25, 1.8]
  },

  // 4. عضلات الجذع والظهر والبطن (Trunk, Back & Abdomen Muscles)
  'trapezius': {
    id: 'trapezius',
    system: 'muscular',
    nameAr: 'العضلة شبه المنحرفة',
    nameEn: 'Trapezius Muscle',
    latinName: 'Musculus Trapezius',
    region: 'torso',
    regionAr: 'أعلى الظهر والرقبة',
    color: '#ab2d2d',
    anatomicalLocationAr: 'أعلى الظهر والرقبة (من قاعدة الجمجمة والفقرات الرقبية والصدرية حتى لوح الكتف والترقوة)',
    primaryFunctionAr: 'تحريك الكتفين ورفع وخفض وسحب لوح الكتف وتثبيت العمود الفقري العلوي',
    functionAr: 'عضلة سطحية مثلثة ضخمة تمتد على طول العنق وأعلى الظهر، تلتقي مع نظيرتها في الجانب الآخر لتشكل شكلاً شبه منحرف؛ ترفع الكتفين ("هز الكتفين") وتدعم استقامة الرأس.',
    clinicalNotesAr: 'الألياف العلوية هي البؤرة الأكثر عرضة لتراكم حمض اللاكتيك والتشنج الليفي العضلي الناتج عن التوتر والجلوس المكتبي الخاطئ، مسببة آلاماً ممتدة حتى الصداع.',
    factsAr: [
      'يغذيها العصب الإضافي الشوكي (العصب القحفي الحادي عشر XI).',
      'تتيح للذراع الارتفاع فوق مستوى الرأس بزاوية تتجاوز 90 درجة بدوران لوح الكتف.'
    ],
    movementOrPathwayAr: 'رفع وخفض وسحب لوح الكتف وبسط العنق',
    primaryView: 'posterior',
    cameraTarget: [0, 1.45, -0.16],
    cameraPosition: [0, 1.45, -2.5]
  },
  'latissimus_dorsi': {
    id: 'latissimus_dorsi',
    system: 'muscular',
    nameAr: 'العضلة العريضة الظهرية',
    nameEn: 'Latissimus Dorsi',
    latinName: 'Musculus Latissimus Dorsi',
    region: 'torso',
    regionAr: 'منتصف وأسفل الظهر',
    color: '#9e2626',
    anatomicalLocationAr: 'منتصف وأسفل الظهر (تنشأ من الفقرات الصدرية السفلية والقطنية وعرف الحرقفة وتنغرز في عظم العضد)',
    primaryFunctionAr: 'سحب الذراع للأسفل والخلف وتقريبه نحو الجذع وتدويره للداخل',
    functionAr: 'أعرض عضلة مسطحة في جسم الإنسان، مسؤولة عن قوة سحب الجسم للأعلى في السباحة والتسلق وتمارين العقلة، وتساهم في إحكام ثبات الجذع أثناء التنفس القوي والسعال.',
    clinicalNotesAr: 'تتصل باللفافة القطنية الصدرية (Thoracolumbar Fascia) المتينة. يغذيها العصب الصدري الظهري، وتستخدم في الجراحات الترميمية كرقعة عضلية جلدية.',
    factsAr: [
      'تمنح الجزء العلوي من الظهر مظهر حرف V العريض المميز للرياضيين.',
      'تعتبر عضلة مساعدة قوية في الزفير الإجباري والسعال الشديد.'
    ],
    movementOrPathwayAr: 'تقريب العضد، بسط الكتف، سحب الجسم عمودياً',
    primaryView: 'posterior',
    cameraTarget: [0.3, 0.82, -0.22],
    cameraPosition: [1.2, 0.82, -2.6]
  },
  'rectus_abdominis': {
    id: 'rectus_abdominis',
    system: 'muscular',
    nameAr: 'العضلة المستقيمة البطنية (عضلات البطن 6-Pack)',
    nameEn: 'Rectus Abdominis (Abs)',
    latinName: 'Musculus Rectus Abdominis',
    region: 'torso',
    regionAr: 'منتصف البطن والجذع',
    color: '#b23535',
    anatomicalLocationAr: 'منتصف البطن (تمتد عمودياً من غضاريف الأضلاع 5-7 وعظم القص حتى ارتفاق العانة)',
    primaryFunctionAr: 'ثني الجذع والعمود الفقري للداخل ودعم وزيادة الضغط الداخلي للبطن',
    functionAr: 'الشريط العضلي العمودي الأمامي للجذع؛ يثني العمود الفقري القطني للأمام، ويحمي الأحشاء الهضمية الداخلية، ويدعم عمليات الزفير والولادة والإخراج برفع الضغط البطني.',
    clinicalNotesAr: 'تقسمها 3 إلى 4 أشرطة وترية متقاطعة تعطيها مظهر المربعات العضلية. قد تتعرض للانفصال العضلي (Diastasis Recti) أثناء الحمل أو السمنة المفرطة.',
    factsAr: [
      'محاطة بغلاف ليفي أبيض سميك يسمى غمد المستقيم، وتلتقي العضلتان عند الخط الأبيض (Linea Alba).',
      'تمنع تقوس أسفل الظهر المفرط (Lordosis) بتثبيت زاوية ميلان الحوض.'
    ],
    movementOrPathwayAr: 'ثني العمود الفقري القطني وضغط الأحشاء ودعم الحوض',
    primaryView: 'anterior',
    cameraTarget: [0, 0.52, 0.24],
    cameraPosition: [0, 0.52, 2.5]
  },
  'obliques': {
    id: 'obliques',
    system: 'muscular',
    nameAr: 'العضلات المائلة الداخلية والخارجية (عضلات الخاصرة)',
    nameEn: 'Abdominal Obliques',
    latinName: 'Musculi Obliqui Abdominis (Externus et Internus)',
    region: 'torso',
    regionAr: 'جوانب البطن والخاصرة',
    color: '#aa3131',
    anatomicalLocationAr: 'جوانب البطن (تغطي الخاصرتين من الأضلاع السفلية الثمانية ممتدة قطرياً نحو عظم الحوض)',
    primaryFunctionAr: 'تدوير الجذع وثنيه جانباً ودعم جدار البطن وتثبيت الحوض أثناء المشي',
    functionAr: 'عضلات متعددة الطبقات تمتد أليافها الخارجية مائلة لأسفل وللداخل (كوضع اليدين في الجيوب) وأليافها الداخلية متعامدة معها، مما يمنح الجذع قوة دوران وثني جانبي فائقة.',
    clinicalNotesAr: 'ضعف عضلات البطن المائلة يقلل استقرار العمود الفقري أثناء الحركات الدورانية الرياضية (كالجولف والبيسبول والتنس) ويزيد خطر الانزلاق الغضروفي.',
    factsAr: [
      'تشكل حافة العضلة المائلة الخارجية الرباط الإربي (Inguinal Ligament) الذي يحوي القناة الإربية.',
      'تتداخل أليافها العلوية مع العضلة المنشارية الأمامية بتشابك نسيجي متين.'
    ],
    movementOrPathwayAr: 'تدوير وثني الجذع الجانبي وتثبيت الحوض',
    primaryView: 'lateral',
    cameraTarget: [0.34, 0.42, 0.16],
    cameraPosition: [1.6, 0.42, 1.8]
  },
  'external_oblique': {
    id: 'external_oblique',
    system: 'muscular',
    nameAr: 'العضلات المائلة الخارجية والداخلية',
    nameEn: 'Abdominal Obliques',
    latinName: 'Musculi Obliqui Abdominis',
    region: 'torso',
    regionAr: 'جوانب البطن والخاصرة',
    color: '#aa3131',
    anatomicalLocationAr: 'جوانب البطن والخاصرة',
    primaryFunctionAr: 'تدوير الجذع وإمالته جانباً',
    functionAr: 'تدوير الجذع وثنيه جانباً.',
    clinicalNotesAr: 'تدعم جدار البطن.',
    factsAr: ['تتداخل مع المنشارية الأمامية.'],
    movementOrPathwayAr: 'تدوير وثني الجذع',
    primaryView: 'lateral',
    cameraTarget: [0.34, 0.42, 0.16],
    cameraPosition: [1.6, 0.42, 1.8]
  },
  'erector_spinae': {
    id: 'erector_spinae',
    system: 'muscular',
    nameAr: 'العضلات الشوكية (منتصبة القامة)',
    nameEn: 'Erector Spinae Muscle Group',
    latinName: 'Musculus Erector Spinae',
    region: 'torso',
    regionAr: 'على طول العمود الفقري والظهر',
    color: '#991b1b',
    anatomicalLocationAr: 'على طول جانبي العمود الفقري (تمتد من عظم العجز والحوض صعوداً حتى قاعدة الجمجمة)',
    primaryFunctionAr: 'بسط واستقامة الظهر والعمود الفقري ومقاومة الانحناء للأمام وحفظ التوازن القائم',
    functionAr: 'مجموعة عضلية عميقة قوية مكونة من ثلاثة أعمدة طولية (الحرقفية الضلعية، الطولى، والشوكية). تحافظ على انحناءات العمود الفقري وتتحكم بمعدل انحناء الظهر وبسطه.',
    clinicalNotesAr: 'التشنج الحاد في عضلات منتصبة القامة القطنية هو السبب الأول لآلام أسفل الظهر الحادة (Lumbago) بعد رفع أحمال ثقيلة بوضعية خاطئة.',
    factsAr: [
      'تعد أهم كتلة عضلية في تطور الجنس البشري للوقوف والمشي على قدمين بانتصاب كامل.',
      'تتميز بوجود نسبة عالية جداً من الألياف العضلية بطيئة الانقباض المقاومة للإجهاد لتعمل طوال ساعات الاستيقاظ.'
    ],
    movementOrPathwayAr: 'بسط واستقامة العمود الفقري والتحكم بالانثناء وتثبيت الجذع',
    primaryView: 'posterior',
    cameraTarget: [0.08, 0.65, -0.18],
    cameraPosition: [0.8, 0.65, -2.4]
  },

  // 5. عضلات الحوض والأرداف (Pelvis & Gluteal Muscles)
  'gluteus_maximus': {
    id: 'gluteus_maximus',
    system: 'muscular',
    nameAr: 'العضلة الألوية الكبرى والوسطى',
    nameEn: 'Gluteus Maximus & Medius',
    latinName: 'Musculi Glutei (Maximus et Medius)',
    region: 'lower_limbs',
    regionAr: 'منطقة الأرداف والحوض',
    color: '#a32424',
    anatomicalLocationAr: 'منطقة الأرداف (من الوجه الخلفي للحرقفة والعجز والعصعص حتى الشريط الحرقفي الظنبوبي وأحدوبة الفخذ)',
    primaryFunctionAr: 'بسط مفصل الورك بقوة، ودفع الجسم للأمام ولأعلى، وتثبيت الحوض أثناء المشي',
    functionAr: 'أضخم وأثقل عضلة مفردة في جسم الإنسان؛ تولد عزم دوران جبار لبسط مفصل الورك عند صعود السلالم والجري والنهوض، بينما تعمل العضلة الألوية الوسطى على تبعيد الورك وتثبيت ميلان الحوض.',
    clinicalNotesAr: 'ضعفها الناجم عن الجلوس المكتبي المديد يُعرف بـ "متلازمة الألوية النائمة" (Gluteal Amnesia)، مما يلقي بحمل ميكانيكي زائد على أوتار الركبة وأسفل الظهر.',
    factsAr: [
      'يتصل جزء كبير من أليافها بالشريط الحرقفي الظنبوبي (IT Band) الممتد حتى الركبة.',
      'يغذيها العصب الألوي السفلي (Inferior Gluteal Nerve).'
    ],
    movementOrPathwayAr: 'بسط وتدوير الورك الوحشي وتثبيت الحوض',
    primaryView: 'posterior',
    cameraTarget: [0.28, -0.05, -0.24],
    cameraPosition: [1.2, -0.05, -2.6]
  },

  // 6. عضلات الطرف السفلي (الفخذ والساق) (Lower Limb Muscles)
  'quadriceps': {
    id: 'quadriceps',
    system: 'muscular',
    nameAr: 'العضلة الرباعية الرؤوس الفخذية (الكوادر)',
    nameEn: 'Quadriceps Femoris',
    latinName: 'Musculus Quadriceps Femoris',
    region: 'lower_limbs',
    regionAr: 'مقدمة الفخذ',
    color: '#b53333',
    anatomicalLocationAr: 'مقدمة الفخذ (الحجرة الأمامية للفخذ ممتدة برؤوسها الأربعة حتى عظم الرضفة وأحدوبة القصبة)',
    primaryFunctionAr: 'بسط مفصل الركبة واستقامة الساق ومساعدة ثني مفصل الورك وتثبيت صابونة الركبة',
    functionAr: 'أضخم كتلة عضلية متكاملة في الجسم، تضم: المستقيمة الفخذية، المتسعة الوحشية، المتسعة الإنسية، والمتسعة الوسطى. تلتقي في وتر الرضفة لتوليد قوة دفع حركية أثناء المشي والقفز والركل.',
    clinicalNotesAr: 'ضعف العضلة المتسعة الإنسية (VMO) يؤدي لسحب غير متوازن للرضفة مسبباً متلازمة الألم الفخذي الرضفي (Runner\'s Knee).',
    factsAr: [
      'قادرة على توليد قوة عضلية تفوق 300 كيلوغرام لحمل الجسم وامتصاص قوى الهبوط عند القفز.',
      'يغذيها العصب الفخذي (Femoral Nerve) المتفرع من الفقرات القطنية L2-L4.'
    ],
    movementOrPathwayAr: 'بسط الركبة وثني مفصل الورك وتثبيت المفصل الرضفي',
    primaryView: 'anterior',
    cameraTarget: [0.28, -0.75, 0.22],
    cameraPosition: [1.0, -0.75, 2.5]
  },
  'quadriceps_femoris': {
    id: 'quadriceps_femoris',
    system: 'muscular',
    nameAr: 'العضلة الرباعية الرؤوس الفخذية',
    nameEn: 'Quadriceps Femoris',
    latinName: 'Musculus Quadriceps Femoris',
    region: 'lower_limbs',
    regionAr: 'مقدمة الفخذ',
    color: '#b53333',
    anatomicalLocationAr: 'مقدمة الفخذ',
    primaryFunctionAr: 'بسط مفصل الركبة واستقامة الساق',
    functionAr: 'الباسطة العظمى لمفصل الركبة.',
    clinicalNotesAr: 'تضم أربعة رؤوس عضلية.',
    factsAr: ['أضخم كتلة عضلية بالجسم.'],
    movementOrPathwayAr: 'بسط الركبة',
    primaryView: 'anterior',
    cameraTarget: [0.28, -0.75, 0.22],
    cameraPosition: [1.0, -0.75, 2.5]
  },
  'hamstrings': {
    id: 'hamstrings',
    system: 'muscular',
    nameAr: 'عضلات المأبض (المأبضية / خلف الفخذ)',
    nameEn: 'Hamstring Muscles',
    latinName: 'Musculi Ischiocrurales',
    region: 'lower_limbs',
    regionAr: 'خلف الفخذ',
    color: '#9c2626',
    anatomicalLocationAr: 'خلف الفخذ (تمتد من حدبة الإسك في الحوض حتى عظام القصبة والشظية تحت الركبة)',
    primaryFunctionAr: 'ثني مفصل الركبة، وبسط مفصل الورك، وإبطاء سرعة تقدم الساق أثناء الجري السريع',
    functionAr: 'مجموعة ثلاثية تتألف من: ذات الرأسين الفخذية، نصف الوترية، ونصف الغشائية. تعمل كفرامل بيوميكانيكية هامة لحماية الركبة وتثبيت الحوض أثناء الانطلاق والسرعات العالية.',
    clinicalNotesAr: 'تمزق أوتار المأبض العضلية هو الإصابة الأكثر تكراراً في كرة القدم وألعاب القوى السريعة بسبب الانقباض اللامركزي العنيف (Eccentric Contraction).',
    factsAr: [
      'أوتارها الإنسية والوحشية تشكل الحدود العلوية للحفرة المأبضية خلف الركبة.',
      'يغذيها الجزء الظنبوبي من العصب الوركي (عرق النسا / Sciatic Nerve).'
    ],
    movementOrPathwayAr: 'ثني الركبة وبسط الورك وتثبيت الجري السريع',
    primaryView: 'posterior',
    cameraTarget: [-0.28, -0.75, -0.22],
    cameraPosition: [-1.0, -0.75, -2.5]
  },
  'gastrocnemius': {
    id: 'gastrocnemius',
    system: 'muscular',
    nameAr: 'العضلة التوأمية الساقية (عضلة السمانة)',
    nameEn: 'Gastrocnemius (Calf Muscle)',
    latinName: 'Musculus Gastrocnemius',
    region: 'lower_limbs',
    regionAr: 'خلف الساق (السمانة)',
    color: '#ad2f2f',
    anatomicalLocationAr: 'خلف الساق (تنشأ برأسين إنسي ووحشي من لقمتي الفخذ وتنتهي في وتر أخيل)',
    primaryFunctionAr: 'ثني القدم أخمصياً (دفع القدم لأسفل والوقوف على الأصابع) ومساعدة ثني الركبة',
    functionAr: 'العضلة السطحية القوية البارزة في الساق الخلفي، توفر قوة الدفع الانفجارية للأمام ولأعلى أثناء المشي، الركض، والقفز، وتنغرز في عظم العقب عبر وتر أخيل.',
    clinicalNotesAr: 'تمزق وتر أخيل المرتبط بها يصدر صوتاً مفاجئاً ويتطلب تدخلاً جراحياً أو تثبيتاً طويلاً. كما تشتهر السمانة بنوبات التقلص العضلي الليلي (Nocturnal Cramps).',
    factsAr: [
      'تعتبر "مضخة وريدية محيطية" حيوية تدفع الدم من أوردة الساقين صعوداً نحو القلب ضد الجاذبية.',
      'يغذيها العصب الظنبوبي (Tibial Nerve).'
    ],
    movementOrPathwayAr: 'ثني القدم أخمصياً وثني الركبة وضخ العائد الوريدي',
    primaryView: 'posterior',
    cameraTarget: [0.28, -1.68, -0.2],
    cameraPosition: [1.0, -1.68, -2.4]
  },
  'gastrocnemius_soleus': {
    id: 'gastrocnemius_soleus',
    system: 'muscular',
    nameAr: 'العضلة التوأمية الساقية وعضلة السمانة',
    nameEn: 'Gastrocnemius & Soleus',
    latinName: 'Musculus Triceps Surae',
    region: 'lower_limbs',
    regionAr: 'خلف الساق',
    color: '#ad2f2f',
    anatomicalLocationAr: 'خلف الساق',
    primaryFunctionAr: 'ثني القدم أخمصياً ودفع الجسم',
    functionAr: 'عضلات السمانة الدافعة للقدم.',
    clinicalNotesAr: 'تنغرز في وتر أخيل.',
    factsAr: ['القلب المحيطي الثاني.'],
    movementOrPathwayAr: 'ثني القدم أخمصياً',
    primaryView: 'posterior',
    cameraTarget: [0.28, -1.68, -0.2],
    cameraPosition: [1.0, -1.68, -2.4]
  },
  'soleus': {
    id: 'soleus',
    system: 'muscular',
    nameAr: 'العضلة النعلية',
    nameEn: 'Soleus Muscle',
    latinName: 'Musculus Soleus',
    region: 'lower_limbs',
    regionAr: 'تحت عضلة الساق والسمانة',
    color: '#9f1239',
    anatomicalLocationAr: 'تحت عضلة الساق (تقع عميقاً تحت التوأمية ممتدة من عظمي القصبة والشظية حتى وتر أخيل)',
    primaryFunctionAr: 'ثني القدم أخمصياً ودعم وضع الوقوف المستقيم ومنع الجسم من السقوط للأمام',
    functionAr: 'عضلة عريضة مسطحة تشبه سمكة موسى (Sole)، غنية بألياف بطيئة الانقباض من النوع الأول المقاومة للإرهاق، تعمل باستمرار للمحافظة على التوازن أثناء الوقوف والمشي البطيء.',
    clinicalNotesAr: 'تتميز بجيوب وريدية ضخمة (Soleal Sinuses)؛ ركود الدم فيها بسبب قلة الحركة بعد العمليات أو الجلوس الطويل هو السبب الرئيسي لجلطات الساق العميقة (DVT).',
    factsAr: [
      'تعد العضلة الأكثر كفاءة في استهلاك الطاقة وحرق الجلوكوز والدهون حتى أثناء الجلوس والوقوف.',
      'تتحد مع العضلة التوأمية لتشكلا معاً عضلة الساق ثلاثية الرؤوس (Triceps Surae).'
    ],
    movementOrPathwayAr: 'ثني القدم أخمصياً ومقاومة الجاذبية في الوقوف المستمر',
    primaryView: 'lateral',
    cameraTarget: [0.32, -1.95, -0.16],
    cameraPosition: [1.3, -1.95, 1.8]
  },
  'tibialis_anterior': {
    id: 'tibialis_anterior',
    system: 'muscular',
    nameAr: 'العضلة الظنبوبية الأمامية',
    nameEn: 'Tibialis Anterior Muscle',
    latinName: 'Musculus Tibialis Anterior',
    region: 'lower_limbs',
    regionAr: 'مقدمة الساق',
    color: '#f43f5e',
    anatomicalLocationAr: 'مقدمة الساق (تنشأ من اللقمة الوحشية وثلثي عظم القصبة العلويين وتنغرز في قاعدة مشط القدم الأول)',
    primaryFunctionAr: 'رفع القدم لأعلى (العطف الظهري / Dorsiflexion) وعكس القدم للداخل (Inversion)',
    functionAr: 'المحرك الأساسي لرفع أصابع وظهر القدم لأعلى لمنع أصابع القدم من الاحتكاك بالأرض أثناء مرحلة التأرجح في المشي، ودعم القوس الطولي الأنسي للقدم.',
    clinicalNotesAr: 'إصابة العصب الشظوي العميق تسبب "هبوط القدم" (Foot Drop)، حيث يعجز المريض عن رفع قدمه ويسحبها أثناء السير. كما تسبب متلازمة إجهاد عظم الساق (Shin Splints) ألماً على طولها.',
    factsAr: [
      'يمر وترها القوي أسفل القيد الباسط العلوي والسفلي للكاحل ويمكن جسّه ورؤيته بوضوح عند رفع القدم لأعلى.',
      'يغذيها العصب الشظوي العميق (Deep Fibular Nerve).'
    ],
    movementOrPathwayAr: 'رفع القدم للأعلى (العطف الظهري) وعكس القدم إنسياً وتثبيت الكاحل',
    primaryView: 'anterior',
    cameraTarget: [0.26, -1.78, 0.16],
    cameraPosition: [1.0, -1.78, 2.2]
  },

  // ==========================================
  // الجهاز العصبي (NERVOUS SYSTEM)
  // ==========================================
  'cerebrum': {
    id: 'cerebrum',
    system: 'nervous',
    nameAr: 'المخ والقشرة المخية',
    nameEn: 'Cerebrum & Cerebral Cortex',
    latinName: 'Cerebrum',
    region: 'head',
    regionAr: 'الجهاز العصبي المركزي - الرأس',
    color: '#38bdf8',
    functionAr: 'مركز الإدراك الواعي، التفكير، الذاكرة، التخطيط، معالجة الحواس، اتخاذ القرار، وإصدار الأوامر الحركية الإرادية لكافة عضلات الجسم.',
    clinicalNotesAr: 'ينقسم لنصفين كرويين يرتبطان بالجسم الثفني (Corpus Callosum)، ويحتوي على 4 فصوص رئيسية: الجبهي، الجداري، الصدغي، والقذالي. الجلطة الدماغية تحدث عند انسداد ترويته الدموية.',
    factsAr: [
      'يحتوي المخ على ما يقارب 86 مليار خلية عصبية (عصبون)، تصنع تريليونات التشابكات العصبية (Synapses).',
      'يستهلك المخ حوالي 20% من إجمالي طاقة وأكسجين الجسم رغم أنه يشكل 2% فقط من وزنه.'
    ],
    movementOrPathwayAr: 'مسارات القشرة المخية الحركية والحسية العليا',
    cameraTarget: [0, 5.8, 0],
    cameraPosition: [0, 5.8, 3.8]
  },
  'cerebellum': {
    id: 'cerebellum',
    system: 'nervous',
    nameAr: 'المخيخ',
    nameEn: 'Cerebellum',
    latinName: 'Cerebellum',
    region: 'head',
    regionAr: 'الجهاز العصبي المركزي - مؤخرة الرأس',
    color: '#60a5fa',
    functionAr: 'تنسيق الحركات العضلية الدقيقة، ضبط التوازن الوضعي للجسم، وتوقيت الحركات المتتالية (كالعزف والركض والقفز) بسلاسة.',
    clinicalNotesAr: 'إصابة المخيخ تؤدي للترنح الحركي (Ataxia)، واضطراب القياس الحركي، وفقدان القدرة على أداء الحركات المتناوبة السريعة.',
    factsAr: [
      'يعني اسمه اللاتيني "المخ الصغير"، ولكنه يحتوي على أكثر من 50% من إجمالي الخلايا العصبية في الدماغ بأكمله!',
      'لا يبدأ الحركات بنفسه، بل يراجع ويعدل الأوامر القادمة من القشرة المخية لتصبح دقيقة وانسيابية.'
    ],
    movementOrPathwayAr: 'تعديل التغذية الراجعة الحركية وتوازن الأذن الداخلية',
    cameraTarget: [0, 5.4, -0.4],
    cameraPosition: [0, 5.4, -3.2]
  },
  'brainstem': {
    id: 'brainstem',
    system: 'nervous',
    nameAr: 'جذع الدماغ (الجسر والبصلة السيسائية)',
    nameEn: 'Brainstem',
    latinName: 'Truncus Encephali',
    region: 'head',
    regionAr: 'قاعدة الدماغ',
    color: '#38bdf8',
    functionAr: 'التحكم التلقائي بالوظائف الحيوية للبقاء: معدل ضربات القلب، ضغط الدم، التنفس، البلع، واليقظة، ونقطة عبور جميع الألياف العصبية.',
    clinicalNotesAr: 'يضم النخاع المستطيل (Medulla Oblongata) والجسر (Pons) والدماغ المتوسط. موت جذع الدماغ يعتبر المعيار الطبي القانوني للوفاة المحققة.',
    factsAr: [
      'تخرج منه 10 من أصل 12 زوجاً من الأعصاب القحفية المتحكمة في الرأس والعنق والأحشاء.',
      'تحدث فيه ظاهرة التصالب الهرمي، حيث تعبر الألياف الحركية من الجانب الأيمن لتتحكم في الجانب الأيسر من الجسم والعكس صحيح.'
    ],
    movementOrPathwayAr: 'المسار القشري النخاعي والمراكز التلقائية القلبية التنفسية',
    cameraTarget: [0, 5.0, 0],
    cameraPosition: [0, 5.0, 3.2]
  },
  'spinal_cord': {
    id: 'spinal_cord',
    system: 'nervous',
    nameAr: 'الحبل الشوكي المركزي',
    nameEn: 'Central Spinal Cord',
    latinName: 'Medulla Spinalis',
    region: 'torso',
    regionAr: 'المحور الشوكي الظهري',
    color: '#0284c7',
    functionAr: 'المسار السريع الفائق لنقل الإشارات الحسية من الجسم للدماغ والأوامر الحركية من الدماغ للعضلات، ومركز الأفعال المنعكسة السريعة.',
    clinicalNotesAr: 'يمتد بطول 45 سم تقريباً وينتهي عند مستوى الفقرة القطنية الأولى أو الثانية (L1-L2) في البالغين فيما يسمى المخروط النخاعي. إصابته تسبب الشلل.',
    factsAr: [
      'الأفعال المنعكسة (Reflexes) كالابتعاد السريع عن جسم ساخن يعالجها الحبل الشوكي محلياً في أجزاء من الثانية دون انتظار الدماغ!',
      'محاط بثلاث طبقات من السحايا وسائل دماغي شوكي يحميه من الصدمات والاهتزازات.'
    ],
    movementOrPathwayAr: 'الأعمدة الظهرية والمسارات القشرية النخاعية',
    cameraTarget: [0, 2.8, -0.2],
    cameraPosition: [0, 2.8, -4.2]
  },
  'brachial_plexus': {
    id: 'brachial_plexus',
    system: 'nervous',
    nameAr: 'الضفيرة العضدية وشبكة أعصاب الكتف',
    nameEn: 'Brachial Plexus',
    latinName: 'Plexus Brachialis',
    region: 'upper_limbs',
    regionAr: 'العنق والكتف',
    color: '#38bdf8',
    functionAr: 'توزيع التعصيب الحسي والحركي الكامل للطرف العلوي والكتف والذراع والساعد واليد بأكملها.',
    clinicalNotesAr: 'تتشكل من الجذور الشوكية C5 إلى T1. قد تتعرض لإصابة تمزق أثناء الولادة العسيرة (شلل إرب Erb\'s Palsy) أو حوادث الدراجات النارية.',
    factsAr: [
      'شبكة معقدة تنقسم إلى جذور، ثم جذوع، ثم انقسامات، ثم حبال، ثم فروع طرفية نهائية تحمي وظيفة اليد في حال تضرر فرع فردي.',
      'تنبثق منها خمسة أعصاب رئيسية للطرف العلوي.'
    ],
    movementOrPathwayAr: 'C5-T1 نحو أعصاب العضد والساعد واليد',
    cameraTarget: [-1.2, 4.0, 0.2],
    cameraPosition: [-1.5, 4.0, 3.2]
  },
  'radial_median_nerves': {
    id: 'radial_median_nerves',
    system: 'nervous',
    nameAr: 'العصب الكعبري والناصف والزندي',
    nameEn: 'Radial, Median & Ulnar Nerves',
    latinName: 'Nervus Radialis, Medianus et Ulnaris',
    region: 'upper_limbs',
    regionAr: 'الذراع والساعد واليد',
    color: '#0ea5e9',
    functionAr: 'العصب الكعبري يبسط الرسغ والأصابع، العصب الناصف يتحكم في قبضة اليد وحس الإبهام والسبابة، والزندي ينسق العضلات الدقيقة بين الأصابع.',
    clinicalNotesAr: 'انضغاط العصب الناصف يسبب خدر وتنميل الأصابع في متلازمة النفق الرسغي، بينما كسر العضد قد يصيب العصب الكعبري مسبباً هبوط اليد.',
    factsAr: [
      'العصب الزندي يمر سطحياً خلف الكوع مباشرة، وعند اصطدامه تشعر بلسعة كهربائية حادة ومشهورة.',
      'تمتلك رؤوس أصابع اليد أعلى كثافة لنهايات الأعصاب الحسية في الجسم بعد اللسان والشفتين.'
    ],
    movementOrPathwayAr: 'مسار العصب الكعبري خلف العضد، والناصف والزندي عبر الساعد إلى راحة اليد',
    cameraTarget: [-2.4, 2.0, 0.1],
    cameraPosition: [-2.6, 2.0, 3.0]
  },
  'sciatic_nerve': {
    id: 'sciatic_nerve',
    system: 'nervous',
    nameAr: 'العصب الوركي (عرق النسا)',
    nameEn: 'Sciatic Nerve',
    latinName: 'Nervus Ischiadicus',
    region: 'lower_limbs',
    regionAr: 'الحوض والفخذ الخلفي',
    color: '#0284c7',
    functionAr: 'أطول وأسمك عصب في جسم الإنسان، ينقل الإشارات الحسية والحركية لمعظم جلد الفخذ الخلفي والساق والقدم وعضلات الطرف السفلي.',
    clinicalNotesAr: 'ينشأ من L4 إلى S3. انضغاط جذوره بانزلاق غضروفي قطني يسبب ألماً حارقاً حاداً يمتد من أسفل الظهر إلى القدم والمعروف شعبياً بـ "عرق النسا" (Sciatica).',
    factsAr: [
      'يصل سمكه عند خروجه من الحوض إلى سمك إبهام يد الإنسان البالغ تقريباً!',
      'ينقسم فوق الركبة إلى فرعين رئيسيين: العصب الظنبوبي والعصب الشظوي المشترك.'
    ],
    movementOrPathwayAr: 'مسار خلفي من الحوض عبر الثلمة الإسكية الكبرى خلف الفخذ إلى الركبة',
    cameraTarget: [-0.9, 0.2, -0.3],
    cameraPosition: [-0.9, 0.2, -3.6]
  },
  'peroneal_tibial_nerves': {
    id: 'peroneal_tibial_nerves',
    system: 'nervous',
    nameAr: 'العصب الشظوي والظنبوبي لأطراف القدم',
    nameEn: 'Tibial & Common Peroneal Nerves',
    latinName: 'Nervus Tibialis et Fibularis',
    region: 'lower_limbs',
    regionAr: 'الساق والقدم',
    color: '#38bdf8',
    functionAr: 'العصب الظنبوبي يعصب عضلات السمانة وباطن القدم، والعصب الشظوي يعصب العضلات الباسطة لرفع القدم للأعلى (Dorsiflexion).',
    clinicalNotesAr: 'يلتف العصب الشظوي المشترك حول عنق عظمة الشظية سطحياً، وإصابته برضوض الركبة أو الجبائر الضاغطة تسبب حالة سقوط القدم (Foot Drop).',
    factsAr: [
      'العصب الظنبوبي يمر في النفق الرصغي عند الكاحل الداخلي، وهو نظير النفق الرسغي في اليد.',
      'الإشارات العصبية تنتقل في هذه المحاور الطويلة بسرعة خارقة تصل إلى 120 متراً في الثانية (أكثر من 400 كم/س) بفضل غمد الميالين!'
    ],
    movementOrPathwayAr: 'من خلف الركبة تفرعاً عبر القصبة والشظية إلى أصابع القدم',
    cameraTarget: [-0.9, -3.2, 0.1],
    cameraPosition: [-0.9, -3.2, 3.4]
  }
};

// ============================================================================
// DYNAMIC INTEGRATION OF BIOLOGICAL DATASET (العظام والعضلات المضافة بالتفصيل)
// ============================================================================
// Mapping coordinates & regions for skeletal dataset items
const SKELETAL_COORDS_MAP: Record<string, { target: [number, number, number]; pos: [number, number, number]; region: 'head' | 'torso' | 'upper_limbs' | 'lower_limbs'; view?: 'anterior' | 'posterior' | 'lateral' }> = {
  bone_skull_parietal: { target: [0, 6.2, 0], pos: [0, 6.2, 4.0], region: 'head' },
  bone_skull_frontal: { target: [0, 6.0, 0.4], pos: [0, 6.0, 4.0], region: 'head' },
  bone_skull_occipital: { target: [0, 5.8, -0.4], pos: [0, 5.8, -4.0], region: 'head', view: 'posterior' },
  bone_mandible: { target: [0, 5.3, 0.4], pos: [0, 5.3, 3.5], region: 'head' },
  bone_maxilla: { target: [0, 5.6, 0.4], pos: [0, 5.6, 3.5], region: 'head' },
  bone_cervical_vertebrae: { target: [0, 4.8, -0.1], pos: [0, 4.8, 3.5], region: 'head' },
  bone_thoracic_vertebrae: { target: [0, 3.0, -0.2], pos: [0, 3.0, -4.0], region: 'torso', view: 'posterior' },
  bone_lumbar_vertebrae: { target: [0, 1.5, -0.2], pos: [0, 1.5, -4.0], region: 'torso', view: 'posterior' },
  bone_sacrum: { target: [0, 0.5, -0.3], pos: [0, 0.5, -3.5], region: 'torso', view: 'posterior' },
  bone_coccyx: { target: [0, 0.1, -0.3], pos: [0, 0.1, -3.2], region: 'torso', view: 'posterior' },
  bone_sternum: { target: [0, 3.2, 0.6], pos: [0, 3.2, 3.8], region: 'torso' },
  bone_ribs: { target: [0, 2.9, 0.2], pos: [0, 2.9, 4.2], region: 'torso' },
  bone_clavicle: { target: [0.8, 4.3, 0.3], pos: [0.8, 4.3, 3.5], region: 'upper_limbs' },
  bone_scapula: { target: [1.1, 3.8, -0.5], pos: [1.1, 3.8, -3.8], region: 'upper_limbs', view: 'posterior' },
  bone_humerus: { target: [1.8, 2.6, 0], pos: [1.8, 2.6, 3.6], region: 'upper_limbs' },
  bone_radius: { target: [2.2, 1.0, 0.1], pos: [2.2, 1.0, 3.4], region: 'upper_limbs' },
  bone_ulna: { target: [2.0, 1.0, -0.1], pos: [2.0, 1.0, 3.4], region: 'upper_limbs' },
  bone_carpals: { target: [2.4, -0.1, 0], pos: [2.4, -0.1, 3.0], region: 'upper_limbs' },
  bone_hip: { target: [0, 0.6, 0], pos: [0, 0.6, 3.8], region: 'lower_limbs' },
  bone_femur: { target: [0.9, -1.2, 0], pos: [0.9, -1.2, 3.8], region: 'lower_limbs' },
  bone_patella: { target: [0.9, -2.3, 0.4], pos: [0.9, -2.3, 3.2], region: 'lower_limbs' },
  bone_tibia: { target: [0.8, -3.4, 0.1], pos: [0.8, -3.4, 3.5], region: 'lower_limbs' },
  bone_fibula: { target: [1.1, -3.4, 0], pos: [1.1, -3.4, 3.5], region: 'lower_limbs' },
  bone_tarsals: { target: [0.9, -4.5, 0.2], pos: [0.9, -4.5, 3.0], region: 'lower_limbs' }
};

// Mapping coordinates & regions for muscular dataset items
const MUSCULAR_COORDS_MAP: Record<string, { target: [number, number, number]; pos: [number, number, number]; region: 'head' | 'torso' | 'upper_limbs' | 'lower_limbs'; view?: 'anterior' | 'posterior' | 'lateral' }> = {
  muscle_masseter: { target: [0.4, 5.4, 0.3], pos: [0.4, 5.4, 3.0], region: 'head' },
  muscle_sternocleidomastoid: { target: [0.5, 4.8, 0.2], pos: [0.5, 4.8, 3.2], region: 'head' },
  muscle_deltoid: { target: [1.8, 3.9, 0.1], pos: [1.8, 3.9, 3.5], region: 'upper_limbs' },
  muscle_biceps: { target: [1.8, 2.7, 0.2], pos: [1.8, 2.7, 3.4], region: 'upper_limbs' },
  muscle_triceps: { target: [1.8, 2.7, -0.2], pos: [1.8, 2.7, -3.4], region: 'upper_limbs', view: 'posterior' },
  muscle_brachioradialis: { target: [2.1, 1.2, 0.1], pos: [2.1, 1.2, 3.2], region: 'upper_limbs' },
  muscle_pectoralis_major: { target: [0.8, 3.4, 0.5], pos: [0.8, 3.4, 3.6], region: 'torso' },
  muscle_trapezius: { target: [0, 4.2, -0.4], pos: [0, 4.2, -3.8], region: 'torso', view: 'posterior' },
  muscle_latissimus_dorsi: { target: [1.0, 2.2, -0.4], pos: [1.0, 2.2, -3.8], region: 'torso', view: 'posterior' },
  muscle_rectus_abdominis: { target: [0, 1.9, 0.5], pos: [0, 1.9, 3.5], region: 'torso' },
  muscle_obliques: { target: [1.2, 1.8, 0.2], pos: [1.2, 1.8, 3.5], region: 'torso' },
  muscle_gluteus_maximus: { target: [0.8, 0.3, -0.5], pos: [0.8, 0.3, -3.6], region: 'lower_limbs', view: 'posterior' },
  muscle_quadriceps: { target: [0.9, -1.2, 0.5], pos: [0.9, -1.2, 3.8], region: 'lower_limbs' },
  muscle_hamstrings: { target: [0.9, -1.3, -0.5], pos: [0.9, -1.3, -3.8], region: 'lower_limbs', view: 'posterior' },
  muscle_gastrocnemius: { target: [0.8, -3.2, -0.4], pos: [0.8, -3.2, -3.6], region: 'lower_limbs', view: 'posterior' },
  muscle_soleus: { target: [0.8, -3.5, -0.3], pos: [0.8, -3.5, -3.4], region: 'lower_limbs', view: 'posterior' },
  muscle_tibialis_anterior: { target: [0.8, -3.3, 0.4], pos: [0.8, -3.3, 3.4], region: 'lower_limbs' }
};

// Register all items from skeletalSystem
skeletalSystem.forEach((b) => {
  const coord = SKELETAL_COORDS_MAP[b.id] || { target: [0, 2.5, 0], pos: [0, 2.5, 4.5], region: 'torso' };
  ANATOMICAL_ITEMS[b.id] = {
    id: b.id,
    system: 'skeletal',
    nameAr: b.nameAr,
    nameEn: b.nameEn,
    latinName: b.nameEn,
    categoryAr: b.category,
    exactLocationAr: b.exactLocation,
    infoAr: b.info,
    region: coord.region,
    regionAr: b.category,
    color: '#f8f5eb',
    functionAr: b.info,
    clinicalNotesAr: `الموقع التشريحي: ${b.exactLocation}`,
    factsAr: [b.info, `التصنيف التشريحي: ${b.category}`],
    cameraTarget: coord.target,
    cameraPosition: coord.pos,
    primaryView: coord.view || 'anterior'
  };
});

// Register all items from muscularSystem (with vivid red #dc2626)
muscularSystem.forEach((m) => {
  const coord = MUSCULAR_COORDS_MAP[m.id] || { target: [0, 2.5, 0], pos: [0, 2.5, 4.5], region: 'torso' };
  ANATOMICAL_ITEMS[m.id] = {
    id: m.id,
    system: 'muscular',
    nameAr: m.nameAr,
    nameEn: m.nameEn,
    latinName: m.nameEn,
    categoryAr: m.category,
    exactLocationAr: m.exactLocation,
    infoAr: m.info,
    region: coord.region,
    regionAr: m.category,
    color: '#dc2626', // Vivid anatomical red
    functionAr: m.info,
    primaryFunctionAr: m.info,
    clinicalNotesAr: `الموقع الدقيق: ${m.exactLocation}`,
    factsAr: [m.info, `التصنيف العضلي: ${m.category}`],
    cameraTarget: coord.target,
    cameraPosition: coord.pos,
    primaryView: coord.view || 'anterior'
  };
});

// Mapping coordinates & regions for nervous dataset items
const NERVOUS_COORDS_MAP: Record<string, { target: [number, number, number]; pos: [number, number, number]; region: 'head' | 'torso' | 'upper_limbs' | 'lower_limbs'; view?: 'anterior' | 'posterior' | 'lateral' }> = {
  nerve_brain_cerebrum: { target: [0, 6.2, 0.1], pos: [0, 6.2, 3.8], region: 'head' },
  nerve_brain_cerebellum: { target: [0, 5.7, -0.3], pos: [0, 5.7, -3.6], region: 'head', view: 'posterior' },
  nerve_brainstem: { target: [0, 5.4, 0], pos: [0, 5.4, 3.4], region: 'head' },
  nerve_spinal_cord: { target: [0, 3.0, -0.2], pos: [0, 3.0, -4.0], region: 'torso', view: 'posterior' },
  nerve_vagus: { target: [0.2, 4.5, 0.1], pos: [0.2, 4.5, 3.2], region: 'head' },
  nerve_brachial_plexus: { target: [0.8, 4.2, 0.1], pos: [0.8, 4.2, 3.2], region: 'upper_limbs' },
  nerve_radial: { target: [1.8, 2.4, -0.1], pos: [1.8, 2.4, 3.4], region: 'upper_limbs' },
  nerve_median: { target: [1.9, 1.8, 0.1], pos: [1.9, 1.8, 3.2], region: 'upper_limbs' },
  nerve_ulnar: { target: [1.7, 1.8, -0.1], pos: [1.7, 1.8, -3.2], region: 'upper_limbs', view: 'posterior' },
  nerve_sciatic: { target: [0.6, 0.0, -0.4], pos: [0.6, 0.0, -3.8], region: 'lower_limbs', view: 'posterior' },
  nerve_femoral: { target: [0.6, 0.2, 0.3], pos: [0.6, 0.2, 3.6], region: 'lower_limbs' }
};

// Register all items from nervousSystem (with glowing electric neural yellow #eab308)
nervousSystem.forEach((n) => {
  const coord = NERVOUS_COORDS_MAP[n.id] || { target: [0, 3.0, 0], pos: [0, 3.0, 4.2], region: 'torso' };
  ANATOMICAL_ITEMS[n.id] = {
    id: n.id,
    system: 'nervous',
    nameAr: n.nameAr,
    nameEn: n.nameEn,
    latinName: n.nameEn,
    categoryAr: n.category,
    exactLocationAr: n.exactLocation,
    infoAr: n.info,
    region: coord.region,
    regionAr: n.category,
    color: '#eab308', // Glowing neural yellow
    functionAr: n.info,
    primaryFunctionAr: n.info,
    clinicalNotesAr: `الموقع التشريحي: ${n.exactLocation}`,
    factsAr: [n.info, `التصنيف العصبي: ${n.category}`],
    cameraTarget: coord.target,
    cameraPosition: coord.pos,
    primaryView: coord.view || 'anterior'
  };
});


export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    questionAr: 'ما هي أطول وأثقل وأقوى عظمة في الهيكل العظمي لجسم الإنسان؟',
    optionsAr: ['عظم الفخذ (Femur)', 'عظم القصبة (Tibia)', 'عظم العضد (Humerus)', 'العمود الفقري (Spine)'],
    correctIndex: 0,
    explanationAr: 'عظم الفخذ هو أطول وأثقل وأقوى عظمة في الجسم، ويتحمل قوى ضغط هائلة تصل لنحو 30 ضعف وزن الجسم.',
    relatedItemId: 'femur',
    system: 'skeletal'
  },
  {
    id: 2,
    questionAr: 'ما هي العضلة المسؤولة بشكل رئيسي عن ثني مفصل المرفق وبطح الساعد (تدوير راحة اليد لأعلى)؟',
    optionsAr: ['العضلة الدالية', 'العضلة ثلاثية الرؤوس', 'العضلة ذات الرأسين العضدية (Biceps)', 'العضلة الصدرية'],
    correctIndex: 2,
    explanationAr: 'العضلة ذات الرأسين العضدية (البايسبس) تثني المرفق وتعتبر أقوى محرك لتدوير راحة اليد لأعلى.',
    relatedItemId: 'biceps',
    system: 'muscular'
  },
  {
    id: 3,
    questionAr: 'ما هو أطول وأسمك عصب مفرد في جسم الإنسان، والذي قد يسبب ألم "عرق النسا" عند انضغاطه؟',
    optionsAr: ['العصب الكعبري', 'العصب الوركي (Sciatic Nerve)', 'العصب المبهم', 'العصب الفخذي'],
    correctIndex: 1,
    explanationAr: 'العصب الوركي هو أطول وأسمك عصب في الجسم (يصل قطره لسمك الإبهام)، ويمتد من أسفل الظهر إلى أصابع القدمين.',
    relatedItemId: 'sciatic_nerve',
    system: 'nervous'
  },
  {
    id: 4,
    questionAr: 'أي جزء من الدماغ مسؤول عن التوازن الحركي الدقيق وتنسيق توقيت الحركات العضلية الرشيقة؟',
    optionsAr: ['المخيخ (Cerebellum)', 'الفص الجبهي', 'النخاع المستطيل', 'الجسم الثفني'],
    correctIndex: 0,
    explanationAr: 'المخيخ هو منسق التوازن والرشاقة الحركية، ويحتوي على أكثر من 50% من الخلايا العصبية في الدماغ.',
    relatedItemId: 'cerebellum',
    system: 'nervous'
  },
  {
    id: 5,
    questionAr: 'كم عدد العظام في جمجمة الإنسان البالغ (باستثناء عظيمات السمع)؟',
    optionsAr: ['12 عظمة', '22 عظمة', '33 عظمة', '206 عظام'],
    correctIndex: 1,
    explanationAr: 'تتكون جمجمة البالغ من 22 عظمة (8 عظام قحفية لحماية الدماغ و 14 عظمة وجهية).',
    relatedItemId: 'skull',
    system: 'skeletal'
  },
  {
    id: 6,
    questionAr: 'ما هي العضلة التي تشكل الجزء الأكبر من الكتف وتُعد الموقع الأكثر استخداماً للحقن العضلي للقاحات؟',
    optionsAr: ['العضلة الدالية (Deltoid)', 'العضلة شبه المنحرفة', 'العضلة الصدرية الكبرى', 'العضلة العريضة الظهرية'],
    correctIndex: 0,
    explanationAr: 'العضلة الدالية تغطي مفصل الكتف كالحرف اليوناني دلتا، وتستخدم حقلياً لحقن اللقاحات.',
    relatedItemId: 'deltoid',
    system: 'muscular'
  },
  {
    id: 7,
    questionAr: 'أين تحدث ردود الفعل المنعكسة السريعة الفورية (مثل الابتعاد عن اللهب الحارق) قبل وصول الإشارة للدماغ؟',
    optionsAr: ['في الحبل الشوكي (Spinal Cord)', 'في العقدة الأذينية', 'في غشاء الطبل', 'في جدار المعدة'],
    correctIndex: 0,
    explanationAr: 'يعالج الحبل الشوكي القوس الانعكاسي محلياً لإنقاذ الأنسجة من الضرر في أجزاء من الثانية دون تأخير التفكير.',
    relatedItemId: 'spinal_cord',
    system: 'nervous'
  },
  {
    id: 8,
    questionAr: 'ما هي وظيفة القفص الصدري وعظم القص الأساسية؟',
    optionsAr: ['حماية القلب والرئتين والمساعدة في التنفس', 'هضم السكريات المعقدة', 'إنتاج هرمون الأنسولين', 'تخزين العصارة الصفراوية'],
    correctIndex: 0,
    explanationAr: 'يحمي القفص الصدري الأعضاء الحيوية في التجويف الصدري (القلب والرئتين والأوعية الدموية الكبرى) ويتمدد أثناء الشهيق والزفير.',
    relatedItemId: 'ribcage_sternum',
    system: 'skeletal'
  }
];
