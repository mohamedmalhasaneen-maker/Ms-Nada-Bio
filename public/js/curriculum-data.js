// =========================================================================
// قاعدة بيانات المنهج الشاملة (الأجهزة الثلاثة: عظام، عضلات، أعصاب) + بنك الأسئلة
// الأطلس التشريحي ثلاثي الأبعاد - الأحياء للثانوية العامة • مس/ ندى بدوي
// =========================================================================

window.ACADEMIC_CURRICULUM = {
  // 1. الجهاز الهيكلي العظمي
  skeletal: {
    id: "skeletal",
    name: "الهيكل العظمي (206 عظمة)",
    shortName: "الهيكل العظمي",
    badge: "206 عظمة",
    accent: "#38bdf8",
    semanticAccent: "#f59e0b",
    sections: [
      {
        name: "عظام الجمجمة والوجه (29 عظمة)",
        key: "skull",
        items: [
          {
            id: "skull_frontal",
            name: "عظم الجبهة (Frontal Bone)",
            count: 1,
            system: "skeletal",
            keys: ["frontal"],
            functionDesc: "عظمة مفردة تشكل مقدمة الجمجمة وسقف محجري العينين والجبين، تحمي الفص الجبهي للمخ.",
            examNote: "تتصل مع العظمين الجداريين عند الدرز الإكليلي بأطراف مسننة ملتحمة."
          },
          {
            id: "skull_parietal",
            name: "العظمان الجداريان (Parietal Bones)",
            count: 2,
            system: "skeletal",
            keys: ["parietal"],
            functionDesc: "عظمتان متماثلتان تشكلان سقف الجمجمة وجانبيها لحماية المخ من الصدمات العلوية.",
            examNote: "يلتقيان في خط الوسط عند الدرز السهمي المتعرج."
          },
          {
            id: "skull_occipital",
            name: "العظم القذالي / القفوي (Occipital Bone)",
            count: 1,
            system: "skeletal",
            keys: ["occipital"],
            functionDesc: "يشكل الجزء الخلفي وقاعدة الجمجمة، ويحتوي قاعه على الثقب الكبير لمرور الحبل الشوكي وتوصيله بالمخ.",
            examNote: "يحتوي على لقمتين مفصليتين تتمفصلان مع السطحين المقعرين للفقرة العنقية الأولى (الأطلس C1)."
          },
          {
            id: "skull_temporal",
            name: "العظمان الصدغيان (Temporal Bones)",
            count: 2,
            system: "skeletal",
            keys: ["temporal"],
            functionDesc: "يقعان على جانبي الجمجمة، ويحتويان على القناة السمعية وعظيمات السمع الداخلية ومفصل الفك.",
            examNote: "يحتويان على النتوء الحلمي والنتوء الإبري وموضع تمفصل الفك السفلي."
          },
          {
            id: "skull_sphenoid_ethmoid",
            name: "العظمان الوتدي والغربالي (Sphenoid & Ethmoid)",
            count: 2,
            system: "skeletal",
            keys: ["sphenoid", "ethmoid"],
            functionDesc: "عظمتان عميقتان في قاعدة الجمجمة؛ الوتدي يربط عظام القحف والغربالي يفصل تجويف الأنف عن المخ.",
            examNote: "العظم الوتدي يحتوي على السرج التركي الذي تستقر فيه الغدة النخامية (سيدة الغدد الصماء)."
          },
          {
            id: "skull_mandible",
            name: "عظم الفك السفلي (Mandible)",
            count: 1,
            system: "skeletal",
            keys: ["mandible"],
            boneId: "bone_mandible",
            functionDesc: "العظمة الوحيدة المتحركة في الجمجمة؛ ترتكز عليها الأسنان السفلية وتتحرك لطحن الطعام والكلام.",
            examNote: "يتمفصل مع العظمين الصدغيين بمفصل زلالي واسع الحركة نسبياً (TMJ)."
          },
          {
            id: "skull_maxilla",
            name: "عظما الفك العلوي (Maxilla)",
            count: 2,
            system: "skeletal",
            keys: ["maxilla"],
            functionDesc: "عظمتان ثابتتان تشكلان سقف الفم الصلب وأرضية محجري العينين وتثبتان الأسنان العلوية.",
            examNote: "الفك العلوي ثابت وغير متحرك وملتحم بباقي عظام الوجه."
          },
          {
            id: "skull_zygomatic",
            name: "عظمتا الوجنة (Zygomatic / Cheek Bones)",
            count: 2,
            system: "skeletal",
            keys: ["zygomatic"],
            functionDesc: "تشكلان بروز الخدين والجدار الخارجي لمحجري العينين وتتصلان بالقوس الوجني.",
            examNote: "موضع ارتكاز هام للعضلات الماضغة وتعبير الوجه."
          },
          {
            id: "skull_nasal_lacrimal",
            name: "عظام الأنف والدمعي والحنك (Nasal, Lacrimal, Palatine)",
            count: 7,
            system: "skeletal",
            keys: ["nasal", "lacrimal", "palatine", "vomer", "concha"],
            functionDesc: "عظام دقيقة تحيط بمجرى التنفس الأنفي وتدعم القنوات الدمعية وسقف الحلق.",
            examNote: "عظم الميكعة (Vomer) ينصف التجويف الأنفي إلى فتحتين."
          },
          {
            id: "auditory_ossicles_hyoid",
            name: "العظيمات السمعية واللامي (Ear Ossicles & Hyoid)",
            count: 7,
            system: "skeletal",
            keys: ["malleus", "incus", "stapes", "hyoid"],
            functionDesc: "6 عظيمات سمعية (المطرقة، السندان، الركاب) لتضخيم الصوت، والعظم اللامي لتثبيت اللسان والحنجرة.",
            examNote: "عظم الركاب (Stapes) هو أصغر عظمة في الجسم، واللامي لا يتمفصل مباشرة مع أي عظمة أخرى."
          }
        ]
      },
      {
        name: "العمود الفقري والفقرات المنفردة (33 فقرة / 26 عظمة)",
        key: "vertebrae",
        items: [
          {
            id: "vert_c1_item",
            name: "الفقرة العنقية الأولى - الأطلس (Atlas C1)",
            count: 1,
            system: "skeletal",
            keys: ["atlas", "(c1)", "c01"],
            boneId: "vert_c1_atlas",
            functionDesc: "حلقة عظمية بدون جسم فقرة ولا نتوء شوكي، بها سطحان مفصليان علويان مقعران لاستقبال لقمتي الجمجمة لإيماءة الرأس (نعم).",
            examNote: "تمفصل الأطلس مع الجمجمة هو مفصل زلالي يسمح بحركة الإيماء الرأسي للأمام والخلف."
          },
          {
            id: "vert_c2_item",
            name: "الفقرة العنقية الثانية - المحور (Axis C2)",
            count: 1,
            system: "skeletal",
            keys: ["axis", "(c2)", "c02"],
            boneId: "vert_c2_axis",
            functionDesc: "تتميز بوجود نتوء سني عمودي بارز (Odontoid Process / Dens) يتمحور حوله عظم الأطلس لدوران الرأس يميناً ويساراً (لا).",
            examNote: "المفصل المحوري الحلقي بين C1 و C2 هو مفصل زلالي مداري (Pivot Joint)."
          },
          {
            id: "vert_c3_c7_item",
            name: "الفقرات العنقية النموذجية (C3 إلى C7)",
            count: 5,
            system: "skeletal",
            keys: ["vertebra c3", "vertebra c4", "vertebra c5", "vertebra c6", "vertebra c7", "c3", "c4", "c5", "c6", "c7", "cervical"],
            boneId: "vert_c4_typical",
            functionDesc: "فقرات متمفصلة متوسطة الحجم في العنق تتميز بوجود ثقوب في نتوءاتها المستعرضة لمرور الشريان الفقري.",
            examNote: "الفقرة C7 بها نتوء شوكي طويل بارز يمكن تحسسه أسفل الرقبة (Vertebra Prominens)."
          },
          {
            id: "vert_t1_t4_item",
            name: "الفقرات الصدرية العلوية (T1 إلى T4)",
            count: 4,
            system: "skeletal",
            exactNames: ["vertebra t1", "vertebra t2", "vertebra t3", "vertebra t4"],
            keys: ["vertebra t1", "vertebra t2", "vertebra t3", "vertebra t4", "thoracic_upper"],
            boneId: "vert_t10_median",
            functionDesc: "فقرات متمفصلة تتصل بأزواج الضلوع العلوية ولها نتوءات شوكية مائلة لأسفل لحماية النخاع الشوكي.",
            examNote: "تتصل كل فقرة بزوج من الضلوع بواسطة نتوءاتها المستعرضة وجسم الفقرة."
          },
          {
            id: "vert_t5_t9_item",
            name: "الفقرات الصدرية الوسطى (T5 إلى T9)",
            count: 5,
            system: "skeletal",
            exactNames: ["vertebra t5", "vertebra t6", "vertebra t7", "vertebra t8", "vertebra t9"],
            keys: ["vertebra t5", "vertebra t6", "vertebra t7", "vertebra t8", "vertebra t9", "thoracic_mid"],
            boneId: "vert_t10_median",
            functionDesc: "فقرات متوسطة بالقفص الصدري تتصل بالضلوع الحقيقية الوسطى وتدعم استقامة الجذع.",
            examNote: "الفقرة رقم 17 في العمود الفقري هي الفقرة المنصفة للعمود الفقري (الصدرية العاشرة T10)."
          },
          {
            id: "vert_t10_item",
            name: "الفقرة رقم 17 المنصفة للعمود الفقري (T10)",
            count: 1,
            system: "skeletal",
            exactNames: ["vertebra t10"],
            keys: ["vertebra t10", "t10", "thoracic_10"],
            boneId: "vert_t10_median",
            functionDesc: "الفقرة الظهرية العاشرة وتقع في منتصف العمود الفقري تماماً (يسبقها 16 فقرة ويليها 16 فقرة).",
            examNote: "سؤال امتحاني متكرر: ما رقم الفقرة المنصفة للعمود الفقري؟ الإجابة: الفقرة رقم 17 (الظهرية العاشرة)."
          },
          {
            id: "vert_t11_t12_item",
            name: "الفقرتان 18 و 19 (T11 و T12 متصلتان بالضلوع العائمة)",
            count: 2,
            system: "skeletal",
            exactNames: ["vertebra t11", "vertebra t12"],
            keys: ["vertebra t11", "vertebra t12", "t11", "t12", "floating_rib_vertebra"],
            boneId: "vert_t12_floating",
            functionDesc: "الفقرتان الظهرية 11 و 12 تتصلان بآخر زوجين من الضلوع (الضلعان العائمان 11 و 12 القصيران اللذان لا يتصلان بالقص).",
            examNote: "الضلوع العائمة تتصل بالفقرتين 18 و 19 من الخلف فقط ولا تصل لعظم القص مما يسمح بتمدد البطن أثناء التنفس."
          },
          {
            id: "vert_l1_l4_item",
            name: "الفقرات القطنية العلوية (L1 إلى L4)",
            count: 4,
            system: "skeletal",
            exactNames: ["vertebra l1", "vertebra l2", "vertebra l3", "vertebra l4"],
            keys: ["vertebra l1", "vertebra l2", "vertebra l3", "vertebra l4", "l1", "l2", "l3", "l4", "lumbar_upper"],
            boneId: "vert_l5",
            functionDesc: "فقرات متمفصلة ضخمة تواجه التجويف البطني وتتحمل ثقل الجزء العلوي من الجسم والضغط الحركي.",
            examNote: "تتميز بأجسام كلوية ضخمة ونتوءات شوكية عريضة ومربعة لحمل الوزن."
          },
          {
            id: "vert_l5_item",
            name: "الفقرة رقم 24 - الأضخم حجماً (L5)",
            count: 1,
            system: "skeletal",
            exactNames: ["vertebra l5"],
            keys: ["vertebra l5", "l5", "lumbar_5"],
            boneId: "vert_l5",
            functionDesc: "آخر فقرة متمفصلة في العمود الفقري، تتميز بأضخم جسم فقرة وأعرض نتوءات مستعرضة لربط الجذع بالعجز.",
            examNote: "ترتيب حجم الفقرات تنازلياً: الفقرات القطنية > الصدرية > العنقية > العصعصية (الضامرة)."
          },
          {
            id: "sacrum_bone",
            name: "عظم العجز (5 فقرات ملتحمة كعظمة واحدة)",
            count: 1,
            system: "skeletal",
            keys: ["sacrum", "sacral"],
            boneId: "vert_sacrum",
            functionDesc: "5 فقرات عجزية ملتحمة عريضة ومفلطحة تشكل الجدار الخلفي للحوض وتتحمل نقل الوزن إلى الطرفين السفليين.",
            examNote: "عدد عظام العمود الفقري 26 عظمة بينما عدد الفقرات 33 فقرة بسبب التحام فقرات العجز (5=1) والعصعص (4=1)."
          },
          {
            id: "coccyx_bone",
            name: "عظم العصعص (4 فقرات ملتحمة كعظمة واحدة)",
            count: 1,
            system: "skeletal",
            keys: ["coccyx", "coccygeal"],
            boneId: "vert_coccyx",
            functionDesc: "4 فقرات عصعصية ملتحمة ضامرة صغيرة تقع في نهاية العمود الفقري وتثبت عضلات قاع الحوض.",
            examNote: "فقرات ضامرة وصغيرة لا يمر بها الحبل الشوكي وتعد من بقايا التطور التشريحي."
          }
        ]
      },
      {
        name: "القفص الصدري والقص والضلوع (37 عظمة)",
        key: "thorax",
        items: [
          {
            id: "sternum_bone",
            name: "عظم القص المفلطح (Sternum)",
            count: 1,
            system: "skeletal",
            keys: ["sternum", "manubrium", "xiphoid"],
            boneId: "bone_sternum",
            functionDesc: "عظمة مفلطحة ومدببة من أسفل، جزؤها السفلي غضروفي. يتصل بها الترقوتان والأزواج العشرة الأولى من الضلوع.",
            examNote: "الجزء السفلي غضروفي لا يتعظم إلا في سن متأخرة، وتتصل به الضلوع بغضاريف مرنة لحركة التنفس."
          },
          {
            id: "true_ribs",
            name: "الضلوع الحقيقية (الأزواج 1 إلى 7)",
            count: 14,
            system: "skeletal",
            keys: ["first rib", "second rib", "third rib", "fourth rib", "fifth rib", "sixth rib", "seventh rib", "rib_1", "rib_2", "rib_3", "rib_4", "rib_5", "rib_6", "rib_7", "true_rib"],
            boneId: "bone_rib_typical",
            functionDesc: "7 أزواج من الضلوع المقوسة تتصل مباشرة بعظم القص من الأمام بواسطة غضاريفها الخاصة.",
            examNote: "تتحرك للأمام والجانبين أثناء الشهيق لزيادة اتساع التجويف الصدري."
          },
          {
            id: "false_ribs",
            name: "الضلوع الكاذبة (الأزواج 8 و 9 و 10)",
            count: 6,
            system: "skeletal",
            keys: ["eighth rib", "ninth rib", "tenth rib", "rib_8", "rib_9", "rib_10", "false_rib"],
            boneId: "bone_rib_typical",
            functionDesc: "3 أزواج من الضلوع تتصل بغضروف الضلع السابع لتصل للقص بطريقة غير مباشرة.",
            examNote: "تتصل بالقص اتصالاً غير مباشر عبر الغضروف المشترك للضلع السابع."
          },
          {
            id: "floating_ribs",
            name: "الضلعان العائمان (الزوجان 11 و 12)",
            count: 4,
            system: "skeletal",
            keys: ["eleventh rib", "twelfth rib", "rib_11", "rib_12", "floating_rib"],
            boneId: "bone_rib_typical",
            functionDesc: "زوجان قصيران من الضلوع يتصلان بالفقرتين 18 و 19 من الخلف ولا يتصلان بعظم القص إطلاقاً.",
            examNote: "لا يصلان للقص مما يمنح جدار البطن المرونة أثناء التنفس وحركة الأحشاء."
          }
        ]
      },
      {
        name: "الحزام الصدري والطرفان العلويان (64 عظمة)",
        key: "upper_limb",
        items: [
          {
            id: "clavicle_bone",
            name: "عظم الترقوة الباطني (Clavicle)",
            count: 2,
            system: "skeletal",
            keys: ["clavicle", "collarbone"],
            boneId: "bone_clavicle",
            functionDesc: "عظمة باطنية رفيعة مزدوجة المنحنى تصل الطرف العلوي بعظم القص وتثبت حركة الكتف للخارج.",
            examNote: "عظمة باطنية (أمامية) تتصل من الداخل بالقص ومن الخارج بأخرم لوح الكتف."
          },
          {
            id: "scapula_bone",
            name: "عظم لوح الكتف الظهرية (Scapula)",
            count: 2,
            system: "skeletal",
            keys: ["scapula", "shoulder_blade"],
            boneId: "bone_scapula",
            functionDesc: "عظمة ظهرية مثلثة طرفها الداخلي عريض والخارجي مدبب يحتوي على التجويف الأروحي.",
            examNote: "يستقر رأس عظم العضد في التجويف الأروحي للوح الكتف مكوناً مفصل الكتف واسع الحركة."
          },
          {
            id: "humerus_bone",
            name: "عظم العضد (Humerus)",
            count: 2,
            system: "skeletal",
            keys: ["humerus", "upper_arm"],
            boneId: "bone_humerus",
            functionDesc: "عظمة طويلة رأسها العلوي يستقر في التجويف الأروحي وطرفها السفلي يتمفصل مع الزند والكعبرة في مفصل الكوع.",
            examNote: "طرفه السفلي يحتوي على لقمة وبكرة تستقر بدقة في تجويف عظم الزند بمفصل الكوع."
          },
          {
            id: "radius_bone",
            name: "عظم الكعبرة المتحركة (Radius)",
            count: 2,
            system: "skeletal",
            keys: ["radius"],
            functionDesc: "عظمة خارجية بالساعد، أصغر من الزند وتدور حركة نصف دائرية (180°) حول عظم الزند الثابت.",
            examNote: "الكعبرة هي العظمة المتحركة بالساعد وطرفها السفلي يتمفصل مع رسغ اليد."
          },
          {
            id: "ulna_bone",
            name: "عظم الزند الثابت (Ulna)",
            count: 2,
            system: "skeletal",
            keys: ["ulna"],
            functionDesc: "عظمة داخلية ثابتة بالساعد، طرفها العلوي يحتوي على تجويف يستقر فيه النتوء الداخلي لعظم العضد.",
            examNote: "عظم الزند ثابت ولا يتحرك ولا يتصل طرفه السفلي اتصالاً مباشراً بعظام الرسغ."
          },
          {
            id: "carpal_bones",
            name: "عظام رسغ اليد (Carpals - 8 عظام)",
            count: 16,
            system: "skeletal",
            keys: ["carpal", "scaphoid", "lunate", "triquetrum", "pisiform", "trapezium", "trapezoid", "capitate", "hamate", "wrist"],
            functionDesc: "8 عظام صغيرة تنتظم في صفين؛ يتصل طرفها العلوي بالطرف السفلي للكعبرة وطرفها السفلي بعظام راحة اليد.",
            examNote: "رسغ اليد = 8 عظام بينما رسغ القدم = 7 عظام (موضع مقارنة متكررة في الامتحانات)."
          },
          {
            id: "metacarpal_bones",
            name: "عظام راحة اليد (Metacarpals - 5 أمشاط)",
            count: 10,
            system: "skeletal",
            keys: ["metacarpal", "palm"],
            functionDesc: "5 عظام مستطيلة رفيعة تؤدي إلى الأصابع الخمسة وتشكل راحة الكف.",
            examNote: "تتمفصل من الخلف مع عظام الرسغ ومن الأمام مع سلاميات الأصابع."
          },
          {
            id: "hand_phalanges",
            name: "سلاميات أصابع اليدين (Hand Phalanges - 14 سلامية)",
            count: 28,
            system: "skeletal",
            keys: ["phalanx", "finger of hand"],
            isHandPhalanx: true,
            functionDesc: "14 سلامية في كل يد (3 سلاميات لكل إصبع عدا الإبهام فيتكون من سلاميتين فقط).",
            examNote: "مجموع عظام الطرف العلوي الواحد = 30 عظمة (1 عضد + 1 كعبرة + 1 زند + 8 رسغ + 5 راحة + 14 سلامية)."
          }
        ]
      },
      {
        name: "الحزام الحوضي والطرفان السفليان (62 عظمة)",
        key: "lower_limb",
        items: [
          {
            id: "pelvic_girdle_bone",
            name: "عظم الحوض (Pelvis / Hip Bones)",
            count: 2,
            system: "skeletal",
            keys: ["hip bone", "pelvis", "ilium", "ischium", "pubis", "coxal"],
            boneId: "bone_pelvis",
            functionDesc: "نصفان متماثلان يلتحمان عند الارتفاق العاني؛ كل نصف مكون من حرقفة ظهرية وعانة وورك وبينهما التجويف الحقي العميق.",
            examNote: "التجويف الحقي أعمق بكثير من التجويف الأروحي مما يمنح مفصل الفخذ ثباتاً هائلاً لتحمل وزن الجسم."
          },
          {
            id: "femur_bone",
            name: "عظم الفخذ (Femur - أطول وأقوى عظمة)",
            count: 2,
            system: "skeletal",
            keys: ["femur", "thigh"],
            boneId: "bone_femur",
            functionDesc: "أطول وأثقل وأمتن عظمة في جسم الإنسان؛ يستقر رأسها الكروي في التجويف الحقي وطرفها السفلي ينتهي بلقمتين لمفصل الركبة.",
            examNote: "يتحمل قوى انضغاطية هائلة ويلتقي بالطرف العلوي للقصبة والرضفة في مفصل الركبة."
          },
          {
            id: "patella_bone",
            name: "عظمة الرضفة (Patella / Kneecap)",
            count: 2,
            system: "skeletal",
            keys: ["patella", "knee_cap"],
            boneId: "bone_patella",
            functionDesc: "عظمة سمسمية صغيرة مستديرة تقع أمام مفصل الركبة داخل وتر العضلة الرباعية لحماية المفصل وتحسين الرفع الميكانيكي.",
            examNote: "تحمي مفصل الركبة من الصدمات الأمامية وتمنع انثناء الساق للأمام."
          },
          {
            id: "tibia_bone",
            name: "عظم القصبة الداخلي (Tibia)",
            count: 2,
            system: "skeletal",
            keys: ["tibia", "shin"],
            functionDesc: "عظمة الساق الداخلية الكبيرة؛ تحمل وزن الجسم بالكامل وتشارك في تكوين مفصلي الركبة والكاحل.",
            examNote: "القصبة تشارك مباشرة في مفصل الركبة مع الفخذ، بينما الشظية لا تشارك في مفصل الركبة."
          },
          {
            id: "fibula_bone",
            name: "عظم الشظية الخارجي (Fibula)",
            count: 2,
            system: "skeletal",
            keys: ["fibula"],
            functionDesc: "عظمة الساق الخارجية الرفيعة؛ تعمل كمرتكز للعضلات وتدعم مفصل الكاحل من الخارج.",
            examNote: "لا تتمفصل مع الفخذ ولا تتحمل الوزن المباشر وإنما تدعم ثبات الكاحل."
          },
          {
            id: "tarsal_calcaneus",
            name: "عظام رسغ القدم والكعب (Tarsals & Calcaneus - 7 عظام)",
            count: 14,
            system: "skeletal",
            keys: ["tarsal", "calcaneus", "talus", "ankle", "cuboid", "navicular", "cuneiform"],
            functionDesc: "7 عظام غير منتظمة أكبرها عظم الكعب الخلفي المرتكز عليه وتر أخيلي لنقل حركة الساق للقدم.",
            examNote: "أكبر عظام العرقوب هي عظمة الكعب، ويتصل بها وتر أخيلي (Achilles Tendon)."
          },
          {
            id: "metatarsal_bones",
            name: "عظام مشط القدم (Metatarsals - 5 أمشاط)",
            count: 10,
            system: "skeletal",
            keys: ["metatarsal", "instep"],
            functionDesc: "5 عظام رفيعة وطويلة تمتد من رسغ القدم إلى أصابع القدم لتكوين قوس القدم الممتص للصدمات.",
            examNote: "قوس مشط القدم يمنح مرونة وامتصاصاً للصدمات أثناء المشي والجري."
          },
          {
            id: "foot_phalanges",
            name: "سلاميات أصابع القدمين (Foot Phalanges - 14 سلامية)",
            count: 28,
            system: "skeletal",
            keys: ["phalanx", "finger of foot", "sesamoid bones of foot", "toe"],
            isFootPhalanx: true,
            functionDesc: "14 سلامية في كل قدم (3 سلاميات لكل إصبع عدا إبهام القدم فيتكون من سلاميتين).",
            examNote: "مجموع عظام الطرف السفلي الواحد = 30 عظمة (1 فخذ + 1 رضفة + 1 قصبة + 1 شظية + 7 رسغ + 5 مشط + 14 سلامية)."
          }
        ]
      }
    ]
  },

  // 2. الجهاز العضلي (Muscular System)
  muscular: {
    id: "muscular",
    name: "الجهاز العضلي (أكثر من 600 عضلة)",
    shortName: "الجهاز العضلي",
    badge: "600+ عضلة",
    accent: "#f43f5e",
    semanticAccent: "#f43f5e",
    sections: [
      {
        name: "عضلات الرأس والرقبة والوجه",
        key: "head_neck",
        items: [
          {
            id: "temporalis_masseter",
            name: "عضلتا الصدغية والماضغة (عضلات الفك)",
            count: 4,
            system: "muscular",
            keys: ["masseter", "temporalis", "pterygoid"],
            functionDesc: "رفع الفك السفلي وإطباق الأسنان بقوة هائلة لطحن الطعام أثناء المضغ وتثبيت حركة الفك.",
            examNote: "تعتبر العضلة الماضغة من أقوى عضلات الجسم البشري نسبةً لحجمها وقوة الضغط الميكانيكي المولدة."
          },
          {
            id: "sternocleidomastoid",
            name: "العضلة القصية الترقوية الثديية (القترائية)",
            count: 2,
            system: "muscular",
            keys: ["sternocleidomastoid", "neck_muscle"],
            functionDesc: "تدوير الرأس لليمين واليسار وثني العنق للأمام، وتعد دليلاً تشريحياً بارزاً في العنق.",
            examNote: "تتصل بالقص والترقوة والنتوء الحلمي للعظم الصدغي، وتغذيها ألياف العصب الشوكي الإضافي (القحفي XI)."
          },
          {
            id: "facial_expression",
            name: "عضلات التعبير الوجهي والدويرية",
            count: 20,
            system: "muscular",
            keys: ["orbicularis", "frontalis", "zygomaticus", "buccinator", "facial", "depressor", "levator labii"],
            functionDesc: "عضلات سطحية لا إرادية متصلة بالجلد تشكل تعبيرات الوجه وإغلاق العينين والفم أثناء الكلام والأكل.",
            examNote: "يغذيها العصب الوجهي (القحفي السابع VII)، وإصابته تسبب شلل بيل (اللقوة)."
          }
        ]
      },
      {
        name: "عضلات الجذع والصدر والبطن",
        key: "trunk_core",
        items: [
          {
            id: "pectoralis_major",
            name: "العضلة الصدرية الكبرى (Pectoralis Major)",
            count: 2,
            system: "muscular",
            keys: ["pectoralis", "pec_major", "chest"],
            functionDesc: "تقريب الذراع للأمام وتدويره للداخل ورفع القفص الصدري للمساعدة في الشهيق العميق.",
            examNote: "عضلة مروحية الشكل تغطي مقدمة الصدر وتتصل بعظم العضد وعظم القص والترقوة."
          },
          {
            id: "latissimus_trapezius",
            name: "عضلتا العريضة الظهرية وشبه المنحرفة",
            count: 4,
            system: "muscular",
            keys: ["latissimus", "trapezius", "back_muscle", "dorsi"],
            functionDesc: "فرد وجذب الذراعين للخلف والأسفل (عضلة السباحين)، ورفع وتثبيت لوح الكتف واستقامة الظهر.",
            examNote: "العريضة الظهرية هي أكبر عضلة مساحة في الجزء العلوي من الجسم وتمنح الظهر شكل حرف V."
          },
          {
            id: "rectus_abdominis",
            name: "عضلات البطن المستقيمة والمائلة (Core)",
            count: 8,
            system: "muscular",
            keys: ["rectus abdominis", "oblique", "transversus abdominis", "rectus_abdominis", "transverse_abdominis", "abdominal", "pyramidalis"],
            functionDesc: "حماية أحشاء البطن، ثني الجذع للأمام، وزيادة الضغط داخل البطن أثناء الزفير والولادة والإخراج.",
            examNote: "عضلات جدار البطن تدعم توازن العمود الفقري ومقاومة الانحناء الزائد للفقرات القطنية."
          },
          {
            id: "diaphragm_intercostal",
            name: "عضلة الحجاب الحاجز والعضلات الوربية",
            count: 25,
            system: "muscular",
            keys: ["diaphragm", "intercostal"],
            functionDesc: "المحرك الأساسي للتنفس؛ يهبط الحجاب الحاجز لأسفل عند الانقباض ويزيد سعة الصدر لدخول الهواء (الشهيق).",
            examNote: "انقباض الحجاب الحاجز يخلق ضغطاً سالباً داخل الرئتين يجبر الهواء الجوي على الاندفاع داخلهما."
          }
        ]
      },
      {
        name: "عضلات الطرف العلوي (الذراع واليد)",
        key: "upper_limb_muscles",
        items: [
          {
            id: "deltoid_muscle",
            name: "العضلة الدالية (عضلة الكتف - Deltoid)",
            count: 2,
            system: "muscular",
            keys: ["deltoid", "shoulder"],
            functionDesc: "رفع وإبعاد الذراع جانبياً عن الجسم حتى زاوية 90 درجة وتثبيت مفصل الكتف.",
            examNote: "عضلة مثلثة قوية تعد موضعاً مثالياً للحقن العضلي في الجزء العلوي من الذراع."
          },
          {
            id: "biceps_brachii",
            name: "العضلة ذات الرأسين العضدية (البايسبس)",
            count: 2,
            system: "muscular",
            keys: ["biceps brachii", "biceps", "brachialis", "coracobrachialis"],
            functionDesc: "عضلة قابضة للساعد نحو العضد ومسؤولة عن انبطاح وبطح اليد (تدوير الكعبرة).",
            examNote: "تعمل بالتضاد التام مع العضلة ثلاثية الرؤوس (Triceps) وفق مبدأ التعصيب المتبادل."
          },
          {
            id: "triceps_brachii",
            name: "العضلة ثلاثية الرؤوس العضدية (الترايسبس)",
            count: 2,
            system: "muscular",
            keys: ["triceps", "anconeus"],
            functionDesc: "عضلة باسطة للساعد عند مفصل الكوع؛ تفرد الذراع للخلف وبسط المفصل.",
            examNote: "تتصل بثلاثة رؤوس ناتئة وتندغم في النتوء الزجي لعظم الزند."
          },
          {
            id: "forearm_hand_muscles",
            name: "عضلات الساعد الدقيقة وأصابع اليد",
            count: 38,
            system: "muscular",
            keys: ["brachioradialis", "flexor carpi", "extensor carpi", "flexor digitorum", "extensor digitorum", "pronator", "supinator", "lumbrical", "thenar", "hypothenar"],
            functionDesc: "تحريك رسغ اليد وقبض وبسط الأصابع الخمسة بدقة فائقة للكتابة والإمساك بالأشياء.",
            examNote: "الأوتار المارة عبر نفق الرسغ تنقل القوة العضلية من الساعد إلى سلاميات الأصابع."
          }
        ]
      },
      {
        name: "عضلات الطرف السفلي (الفخذ والساق والقدم)",
        key: "lower_limb_muscles",
        items: [
          {
            id: "gluteus_maximus",
            name: "العضلة الألوية الكبرى (Gluteus Maximus)",
            count: 2,
            system: "muscular",
            keys: ["gluteus", "gluteal"],
            functionDesc: "بسط مفصل الفخذ والمحافظة على استقامة الوقوف وصعود السلالم والجري.",
            examNote: "تعد العضلة الأكبر حجماً والأثقل وزناً في جسم الإنسان البالغ."
          },
          {
            id: "quadriceps_femoris",
            name: "العضلة رباعية الرؤوس الفخذية (الأمامية)",
            count: 2,
            system: "muscular",
            keys: ["quadriceps", "rectus femoris", "vastus lateralis", "vastus medialis", "vastus intermedius", "rectus_femoris", "vastus"],
            functionDesc: "أقوى عضلة باسطة لمفصل الركبة (فرد الساق) وتلعب دوراً محورياً في ركل الكرة والقفز.",
            examNote: "يتجمع وترها حول عظم الرضفة ليزيد من ذراع الرافعة الميكانيكية للساق."
          },
          {
            id: "hamstrings_sartorius",
            name: "العضلات الخلفية الفخذية (المأبضية) والخياطية",
            count: 6,
            system: "muscular",
            keys: ["hamstring", "biceps femoris", "biceps_femoris", "semitendinosus", "semimembranosus", "sartorius"],
            functionDesc: "ثني الركبة للخلف ومد الفخذ، والعضلة الخياطية هي أطول عضلة شريطية بالجسم لوضعية الجلوس المتربع.",
            examNote: "تعمل بالتضاد المباشر مع العضلة رباعية الرؤوس لتحقيق التناغم الحركي عند الجري."
          },
          {
            id: "gastrocnemius_achilles",
            name: "العضلة التوأمية (بطة الساق) ووتر أخيلي",
            count: 4,
            system: "muscular",
            keys: ["gastrocnemius", "soleus", "achilles", "calcaneal tendon", "calcaneal_tendon"],
            functionDesc: "عضلة ربلة الساق مسؤولة عن ثني القدم لأسفل ورفع الكعب أثناء المشي والقفز عبر وتر أخيل.",
            examNote: "تمزق وتر أخيل (بسبب بذل مجهود عنيف أو تقلص مفاجئ) يتطلب التدخل الجراحي أو الأدوية المضادة للالتهاب والجبيرة."
          }
        ]
      }
    ]
  },

  // 3. الجهاز العصبي (Nervous System)
  nervous: {
    id: "nervous",
    name: "الجهاز العصبي (المركزي والطرفي)",
    shortName: "الجهاز العصبي",
    badge: "31+12 عصب",
    accent: "#0ea5e9",
    semanticAccent: "#0ea5e9",
    sections: [
      {
        name: "الجهاز العصبي المركزي (CNS)",
        key: "cns",
        items: [
          {
            id: "cerebrum_lobes",
            name: "المخ وفصوص القشرة المخية (الفصوص الأربعة)",
            count: 1,
            system: "nervous",
            keys: ["cerebrum", "cerebral", "hemisphere", "frontal", "parietal", "temporal", "occipital", "cortex", "thalamus", "corpus callosum"],
            functionDesc: "الفص الجبهي (الحركات الإرادية والذاكرة والنطق)، الجداري (الإحساس)، الصدغي (السمع والشم)، والقذالي (البصر).",
            examNote: "تحتوي القشرة المخية على حوالي 86 مليار خلية عصبية تنظم الوظائف العقلية والإدراكية العليا."
          },
          {
            id: "cerebellum_balance",
            name: "المخيخ (Cerebellum - حفظ التوازن)",
            count: 1,
            system: "nervous",
            keys: ["cerebellum", "cerebellar"],
            functionDesc: "حفظ توازن الجسم وتنسيق الانقباضات العضلية الإرادية بالتعاون مع الأذن الداخلية وعضلات الجسم.",
            examNote: "إصابة المخيخ تؤدي للترنح وفقدان التناسق الحركي دون حدوث شلل في العضلات."
          },
          {
            id: "brainstem_medulla",
            name: "جذع الدماغ والنخاع المستطيل (المراكز الحيوية)",
            count: 1,
            system: "nervous",
            keys: ["brainstem", "medulla", "pons", "midbrain", "ventricle"],
            functionDesc: "يحتوي على المراكز العصبية الحيوية اللاإرادية (التنفس، نبض القلب، حركات الأوعية، والبلع والقيء).",
            examNote: "إصابة النخاع المستطيل قاتلة فوراً لتوقف مراكز التنفس والدورة الدموية."
          },
          {
            id: "spinal_cord_cns",
            name: "الحبل الشوكي (القناة الشوكية)",
            count: 1,
            system: "nervous",
            keys: ["spinal cord", "spinal_cord", "central canal", "myelon", "medulla_spinalis"],
            functionDesc: "يمتد داخل القناة العصبية بالعمود الفقري بطول ~45 سم، وينقل السيالات العصبية وهو مركز الأفعال المنعكسة الشوكية.",
            examNote: "المادة الرمادية الداخلية فراشية الشكل تضم أجسام الخلايا، والمادة البيضاء الخارجية تضم الألياف العصبية الميالينية."
          }
        ]
      },
      {
        name: "الجهاز العصبي الطرفي (PNS)",
        key: "pns",
        items: [
          {
            id: "cranial_nerves",
            name: "الأعصاب المخية / القحفية (12 زوجاً)",
            count: 24,
            system: "nervous",
            keys: ["cranial", "vagus", "optic", "olfactory", "oculomotor", "trigeminal", "facial nerve", "facial_nerve", "glossopharyngeal", "hypoglossal"],
            functionDesc: "12 زوجاً تخرج من الدماغ لتغذية الرأس والرقبة، وأهمها العصب الحائر (العاشر X) المغذي للقلب والأحشاء.",
            examNote: "العصب الحائر هو أطول عصب قحفي وينظم ضربات القلب والهضم تحت تأثير الجهاز الباراسمبثاوي."
          },
          {
            id: "brachial_plexus",
            name: "الضفيرة العضدية وأعصاب الطرف العلوي",
            count: 10,
            system: "nervous",
            keys: ["brachial plexus", "brachial_plexus", "radial nerve", "radial_nerve", "median nerve", "median_nerve", "ulnar nerve", "ulnar_nerve", "musculocutaneous", "axillary nerve"],
            functionDesc: "شبكة عصبية تخرج من الفقرات العنقية لتغذية عضلات وحس الكتف والذراع والساعد واليد.",
            examNote: "العصب الكعبري والناصف والزندي يغذون حركات الأصابع والقبضة الدقيقة."
          },
          {
            id: "sciatic_nerve",
            name: "العصب الوركي (عرق النسا - Sciatic Nerve)",
            count: 2,
            system: "nervous",
            keys: ["sciatic", "ischiadicus", "tibial nerve", "tibial_nerve", "peroneal", "fibular nerve"],
            functionDesc: "أطول وأثخن عصب مفرد في جسم الإنسان، يمتد من الضفيرة القطنية العجزية إلى أسفل القدم.",
            examNote: "انضغاط جذوره بالانزلاق الغضروفي القطني يسبب آلام عرق النسا الممتدة على طول الساق."
          },
          {
            id: "spinal_nerves_total",
            name: "الأعصاب الشوكية (31 زوجاً)",
            count: 62,
            system: "nervous",
            keys: ["spinal nerve", "spinal_nerve", "intercostal nerve", "intercostal_nerve", "lumbar plexus", "lumbar_plexus", "sacral plexus", "sacral_plexus", "cauda equina", "cauda_equina"],
            functionDesc: "8 عنقية + 12 صدرية + 5 قطنية + 5 عجزية + 1 عصعصي، جميعها أعصاب مختلطة (حسية وحركية).",
            examNote: "كل عصب شوكي له جذر ظهري حسي وجذر بطني حركي (موضع سؤال أساسي بالامتحانات)."
          }
        ]
      }
    ]
  }
};

// بنك أسئلة وتحديات الأحياء للثانوية العامة
window.QUIZ_QUESTIONS = [
  {
    question: "كم يبلغ عدد عظام القفص الصدري المتصلة بعظم القص اتصالاً مباشراً أو غير مباشر؟",
    topic: "الهيكل العظمي",
    options: [
      "20 عظمة (10 أزواج من الضلوع)",
      "22 عظمة (20 ضلعاً + ترقوتان)",
      "24 عظمة (جميع الضلوع)",
      "12 عظمة"
    ],
    correctIndex: 1,
    explanation: "يتصل بعظم القص من الأمام: عظمتا الترقوة (2) + الأزواج العشرة الأولى من الضلوع (20 ضلعاً: 7 حقيقية مباشرة و3 كاذبة غير مباشرة) = 22 عظمة."
  },
  {
    question: "أثناء الانقباض العضلي التام وفق نظرية الخيوط المنزلقة لهكسلي، أي المناطق التالية ينعدم طولها تماماً؟",
    topic: "الجهاز العضلي",
    options: [
      "المنطقة المضيئة (I)",
      "المنطقة الداكنة (A)",
      "المنطقة شبه المضيئة (H)",
      "المسافة بين خطي Z"
    ],
    correctIndex: 2,
    explanation: "المنطقة شبه المضيئة (H) تتكون من خيوط الميوسين فقط، وعند الانقباض التام تتداخل خيوط الأكتين في المركز فتنعدم المنطقة H."
  },
  {
    question: "أي من الأعصاب التالية يعتبر أطول وأثخن عصب مفرد في جسم الإنسان؟",
    topic: "الجهاز العصبي",
    options: [
      "العصب الحائر (Vagus Nerve)",
      "العصب الوركي (عرق النسا - Sciatic)",
      "العصب الكعبري (Radial Nerve)",
      "العصب الشوكي الإضافي"
    ],
    correctIndex: 1,
    explanation: "العصب الوركي (Sciatic Nerve) هو أطول وأسمك عصب في الجسم، يخرج من الضفيرة القطنية العجزية ويمتد أسفل الساق والقدم."
  },
  {
    question: "ما النتيجة المترتبة على غياب جزيئات الـ ATP بعد حدوث الانقباض العضلي؟",
    topic: "الجهاز العضلي",
    options: [
      "حدوث ارتخاء فوري للعضلة",
      "عدم انفصال الروابط المستعرضة وحدوث شد عضلي مؤلم",
      "تفكك خيوط الأكتين والميوسين",
      "زيادة تدفق أيونات الكالسيوم"
    ],
    correctIndex: 1,
    explanation: "يلزم جزيء ATP لفصل الروابط المستعرضة للميوسين عن خيوط الأكتين؛ وغيابه يؤدي لثبات الالتصاق وحدوث الشد العضلي المستمر."
  },
  {
    question: "عظمة الفخذ تستقر برأسها العلوي في أي تجويف؟",
    topic: "الهيكل العظمي",
    options: [
      "التجويف الأروحي (Glenoid Cavity)",
      "التجويف الحقي (Acetabulum)",
      "تجويف الزند",
      "القناة العصبية"
    ],
    correctIndex: 1,
    explanation: "يستقر رأس الفخذ في التجويف الحقي العميق بالحزام الحوضي، بينما يستقر رأس العضد في التجويف الأروحي بلوح الكتف."
  }
];

// حقائق علمية متجددة أثناء التحميل وفي الواجهة الرئيسية
window.CURRICULUM_FACTS = [
  "تتآزر ثلاثة أجهزة لحدوث الحركة: الجهاز الهيكلي (دعائم وروافع ومفاصل)، الجهاز العضلي (قوة الانقباض والانبساط)، والجهاز العصبي (إصدار الأوامر والسيالات العصبية).",
  "عدد فقرات العمود الفقري 33 فقرة، بينما عدد عظامه 26 عظمة فقط نظراً التحام الفقرات العجزية الخمس كعظمة واحدة والفقرات العصعصية الأربع كعظمة واحدة.",
  "الفقرة رقم 17 في العمود الفقري هي الفقرة المنصفة للعمود الفقري (الظهرية العاشرة T10)، يسبقها 16 فقرة ويليها 16 فقرة تماماً.",
  "رسغ اليد يتكون من 8 عظام في صفين، بينما رسغ القدم (العرقوب) يتكون من 7 عظام أكبرها عظمة الكعب المتصلة بوتر أخيل."
];
