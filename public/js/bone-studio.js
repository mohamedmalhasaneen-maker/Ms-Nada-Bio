// =========================================================================
// استوديو استخراج وفحص العظام والفقرات ثلاثي الأبعاد (3D Bone Studio)
// =========================================================================
(function () {
  const BONE_REGISTRY = [
    // --- 1. فقرات العمود الفقري (Vertebrae) ---
    {
      id: "vert_c1_atlas",
      name: "الفقرة العنقية الأولى - الفهر / الأطلس (C1 Atlas)",
      category: "vertebra",
      badge: "C1 • إيماءة الرأس (نعم)",
      generator: "atlas",
      articulation: "تتمفصل من أعلى مع لقمتي الجمجمة بمفصل زلالي، ومن أسفل مع نتوء المحور السني (C2).",
      examTrivia: "عديمة جسم الفقرة والنتوء الشوكي تماماً؛ وظيفتها حمل الجمجمة وتمكين حركة الإيماء للأمام والخلف.",
      landmarks: [
        { id: "anterior_arch", name: "القوس الأمامي (Anterior Arch)", desc: "قوس عظمي أمامي يتمفصل داخلياً مع النتوء السني للمحور", pos: [0, 0, 0.28], color: 0x00f0ff },
        { id: "neural_foramen", name: "القناة العصبية الكبرى (Vertebral Foramen)", desc: "تجويف حلقي عريض لمرور الحبل الشوكي وجذع المخ بأمان", pos: [0, 0, 0], color: 0x38bdf8 },
        { id: "sup_facets", name: "السطحان المفصليان العلويان (Superior Facets)", desc: "سطحان بيضاويان مقعران لاستقبال لقمتي العظم القذالي للجمجمة", pos: [0.3, 0.12, 0.05], color: 0xa855f7 },
        { id: "transverse_c1", name: "النتوءان المستعرضان (Transverse Process)", desc: "زائدتان جانبيتان بهما ثقبان لمرور الشريان الفقري المغذي للمخ", pos: [0.48, -0.02, 0], color: 0x10b981 },
        { id: "posterior_tubercle", name: "الحديبة الخلفية (Posterior Tubercle)", desc: "بروز عظمي صغير خلفي بديل عن النتوء الشوكي الغائب", pos: [0, 0.02, -0.3], color: 0xf59e0b }
      ]
    },
    {
      id: "vert_c2_axis",
      name: "الفقرة العنقية الثانية - المحور (C2 Axis)",
      category: "vertebra",
      badge: "C2 • دوران الرأس (لا)",
      generator: "axis",
      articulation: "تتمفصل مع الأطلس C1 بواسطة النتوء السني بمفصل مداري زلالي، ومع C3 من أسفل بمفصل غضروفي.",
      examTrivia: "بروز النتوء السني (Dens) يخترق حلقة الأطلس ليعمل كمحور ارتكاز يتيح تدوير الرأس لليمين واليسار بزاوية واسعة.",
      landmarks: [
        { id: "dens", name: "النتوء السني البارز (Dens / Odontoid)", desc: "محور ارتكاز أسطواني عمودي يدور حوله الأطلس لنفي الحركة (لا)", pos: [0, 0.35, 0.12], color: 0xf43f5e },
        { id: "c2_body", name: "جسم الفقرة (Body / Centrum)", desc: "جسم عظمي متين يدعم استقرار الرقبة وارتكاز الحركات الرأسية", pos: [0, -0.15, 0.18], color: 0x00f0ff },
        { id: "c2_spinous", name: "النتوء الشوكي المشقوق (Bifid Spinous)", desc: "نتوء شوكي خلفي مشقوق ترتكز عليه عضلات الرقبة القوية", pos: [0, -0.05, -0.38], color: 0xf59e0b },
        { id: "c2_transverse", name: "النتوء المستعرض (Transverse)", desc: "زائدة جانبية تحتوي على الثقب المستعرض للشريان الفقري", pos: [0.4, -0.1, 0.05], color: 0x10b981 }
      ]
    },
    {
      id: "vert_c4_typical",
      name: "فقرة عنقية نموذجية (C3 - C7 Typical)",
      category: "vertebra",
      badge: "عنقية متمفصلة • C3-C7",
      generator: "vertebra_typical",
      articulation: "تتمفصل مع الفقرات المجاورة بأقراص غضروفية ونقر مفصلية زلالية متطابقة.",
      examTrivia: "الفقرات العنقية تتميز بصغر حجم أجسامها ووجود ثقوب في نتوءاتها المستعرضة لمرور الأوعية الدموية للمخ.",
      landmarks: [
        { id: "centrum", name: "جسم الفقرة (Centrum)", desc: "جزء أمامي سميك يتحمل ثقل الرأس", pos: [0, -0.12, 0.22], color: 0x00f0ff },
        { id: "canal", name: "القناة العصبية (Neural Canal)", desc: "ممر الحبل الشوكي المحمي بالحلقة الشوكية", pos: [0, 0, 0], color: 0x38bdf8 },
        { id: "spinous", name: "النتوء الشوكي (Spinous Process)", desc: "زائدة خلفية مائلة لتثبيت الأربطة", pos: [0, -0.08, -0.38], color: 0xf59e0b },
        { id: "transverse", name: "النتوء المستعرض (Transverse)", desc: "يحتوي على ثقب الشريان الفقري", pos: [0.42, 0, 0.05], color: 0x10b981 }
      ]
    },
    {
      id: "vert_t10_median",
      name: "الفقرة رقم 17 المنصفة للعمود الفقري (T10 Thoracic)",
      category: "vertebra",
      badge: "الفقرة رقم 17 • منصفة العمود",
      generator: "vertebra_thoracic",
      articulation: "تتمفصل مع زوج الضلوع العاشر، ومع الفقرتين الظهرية التاسعة والحادية عشرة.",
      examTrivia: "الفقرة رقم 17 في العمود الفقري هي الفقرة الظهرية العاشرة وتقسم العمود الفقري بالتساوي (16 فقرة قبلها و16 بعدها).",
      landmarks: [
        { id: "centrum", name: "جسم الفقرة الصدري (Thoracic Body)", desc: "جسم عظمي قلبي الشكل يحتوي على مواضع تمفصل رأس الضلع", pos: [0, -0.15, 0.24], color: 0x00f0ff },
        { id: "rib_facet", name: "السطح المفصلي الضلعي (Costal Facet)", desc: "موضع اتصال رأس الضلع العاشر بجسم الفقرة ونتوئها المستعرض", pos: [0.28, -0.05, 0.18], color: 0xf43f5e },
        { id: "spinous_long", name: "النتوء الشوكي الطويل الحاد", desc: "يميل بشدة للأسفل ليوفر حماية إضافية للنخاع الشوكي بالصدر", pos: [0, -0.22, -0.42], color: 0xf59e0b },
        { id: "transverse_t", name: "النتوء المستعرض الضلعي", desc: "يتمفصل مع حديبة الضلع المقابل", pos: [0.44, 0.05, -0.05], color: 0x10b981 },
        { id: "sup_art", name: "النتوء المفصلي الأمامي / العلوي", desc: "يتجه للخلف والأعلى للتمفصل مع T9", pos: [0.18, 0.22, -0.1], color: 0xa855f7 },
        { id: "inf_art", name: "النتوء المفصلي الخلفي / السفلي", desc: "يتجه للأمام والأسفل للتمفصل مع T11", pos: [0.18, -0.25, -0.18], color: 0x06b6d4 }
      ]
    },
    {
      id: "vert_t12_floating",
      name: "الفقرة رقم 19 المتصلة بالضلوع العائمة (T12)",
      category: "vertebra",
      badge: "الفقرة رقم 19 • اتصال الضلع العائم",
      generator: "vertebra_thoracic",
      articulation: "تتصل بالزوج الثاني عشر من الضلوع (الضلعان العائمان)، وتتمفصل مع أول فقرة قطنية (L1).",
      examTrivia: "تتميز بأن نتوءها المفصلي السفلي يماثل الفقرات القطنية ليسمح بالانتقال التشريحي بين الصدر والبطن.",
      landmarks: [
        { id: "centrum", name: "جسم الفقرة (Centrum)", desc: "أكبر حجماً من الفقرات الصدرية السابقة", pos: [0, -0.15, 0.25], color: 0x00f0ff },
        { id: "floating_facet", name: "مفصل الضلع العائم 12", desc: "موضع ارتكاز الضلع العائم القصير الذي لا يصل للقص", pos: [0.3, -0.08, 0.15], color: 0xf43f5e },
        { id: "canal", name: "القناة العصبية", desc: "نهاية الحبل الشوكي وبداية ذيل الفرس", pos: [0, 0, 0], color: 0x38bdf8 }
      ]
    },
    {
      id: "vert_l5",
      name: "الفقرة رقم 24 - الأضخم حجماً (L5 Lumbar)",
      category: "vertebra",
      badge: "الفقرة رقم 24 • الأكبر حجماً والأكثر تحملاً",
      generator: "vertebra_lumbar",
      articulation: "تتمفصل مع الفقرة القطنية الرابعة L4 من أعلى، ومع عظم العجز الملتحم من أسفل.",
      examTrivia: "الفقرة رقم 24 هي آخر فقرة متمفصلة وأضخم فقرات العمود الفقري لمقاومة قوى الانضغاط وثقل الجذع كاملاً.",
      landmarks: [
        { id: "massive_centrum", name: "جسم الفقرة الضخم (Massive Body)", desc: "أكبر جسم عظمي كلوي الشكل يتحمل أكثر من 60% من وزن الجسم", pos: [0, -0.18, 0.26], color: 0x00f0ff },
        { id: "lumbar_canal", name: "القناة الشوكية المثلثة", desc: "تحتوي على الجذور العصبية لذيل الفرس (Cauda Equina)", pos: [0, 0, 0], color: 0x38bdf8 },
        { id: "spinous_quad", name: "النتوء الشوكي المربع العريض", desc: "شكل رباعي أفقي سميك لتثبيت العضلات القطنية العميقة", pos: [0, -0.05, -0.45], color: 0xf59e0b },
        { id: "thick_transverse", name: "النتوءان المستعرضان الهائلان", desc: "نتوءات سميكة جداً ترتبط بالرباط الحرقفي القطني القوي", pos: [0.48, 0.02, 0.02], color: 0x10b981 },
        { id: "l5_sup_facet", name: "النتوءان المفصليان الأماميان العلويان", desc: "يتمفصلان مع نتوءات L4 السفلية", pos: [0.22, 0.26, -0.14], color: 0xa855f7 },
        { id: "l5_inf_facet", name: "النتوءان المفصليان الخلفيان السفليان", desc: "يتمفصلان مع السطحين المفصليين للعجز", pos: [0.22, -0.28, -0.22], color: 0xf43f5e }
      ]
    },
    {
      id: "vert_sacrum",
      name: "عظم العجز (5 فقرات ملتحمة كعظمة واحدة)",
      category: "vertebra",
      badge: "5 فقرات ملتحمة = 1 عظمة",
      generator: "sacrum",
      articulation: "يتمفصل مع الحرقفتين بمفصلين حرقفيين عجزيين، ومع L5 من أعلى، والعصعص من أسفل.",
      examTrivia: "عظمة مثلثة عريضة ومفلطحة؛ فقراتها ملتحمة لتشكيل جدار الحوض الخلفي الصلب لحمل الوزن وتوزيعه للأطراف.",
      landmarks: [
        { id: "sacral_promontory", name: "الرعن العجزي (Sacral Promontory)", desc: "الحافة الأمامية البارزة لارتكاز القرص الغضروفي مع L5", pos: [0, 0.32, 0.15], color: 0x00f0ff },
        { id: "sacral_foramina", name: "الثقوب العجزية (Sacral Foramina)", desc: "4 أزواج من الثقوب الأمامية والخلفية لخروج الأعصاب الشوكية العجزية", pos: [0.18, 0, 0.12], color: 0x38bdf8 },
        { id: "sacral_canal", name: "القناة العجزية (Sacral Canal)", desc: "امتداد القناة الشوكية التي تنتهي بالفرجة العجزية", pos: [0, 0.15, -0.05], color: 0xa855f7 },
        { id: "auricular_surface", name: "السطح الصيواني المفصلي (Auricular)", desc: "سطح خشن للتمفصل المتين مع عظم الحرقفة بالحوض", pos: [0.38, 0.18, 0.02], color: 0x10b981 }
      ]
    },
    {
      id: "vert_coccyx",
      name: "عظم العصعص (4 فقرات ملتحمة كعظمة واحدة)",
      category: "vertebra",
      badge: "4 فقرات ملتحمة = 1 عظمة",
      generator: "coccyx",
      articulation: "يتمفصل مع قمة العجز بمفصل غضروفي قليل الحركة.",
      examTrivia: "فقرات ضامرة وصغيرة تقع في نهاية العمود الفقري ولا يمر بها الحبل الشوكي.",
      landmarks: [
        { id: "coccyx_base", name: "قاعدة العصعص (Base)", desc: "موضع التمفصل مع قمة عظم العجز", pos: [0, 0.15, 0], color: 0x00f0ff },
        { id: "coccyx_cornu", name: "القرنان العصعصيان (Cornua)", desc: "بروزان علويان يرتبطان بقرني العجز بالأربطة", pos: [0.12, 0.18, -0.05], color: 0xf59e0b },
        { id: "coccyx_apex", name: "قمة العصعص المدببة (Apex)", desc: "نهاية العمود الفقري السفلية المرتكز عليها قاع الحوض", pos: [0, -0.2, 0.04], color: 0xf43f5e }
      ]
    },

    // --- 2. عظام الهيكل المحوري والطرفي الأساسية (Individual Bones) ---
    {
      id: "bone_mandible",
      name: "عظم الفك السفلي المتحرك (Mandible)",
      category: "bone",
      badge: "العظمة الوحيدة المتحركة بالجمجمة",
      generator: "mandible",
      articulation: "يتمفصل مع العظم الصدغي للجمجمة عبر المفصل الصدغي الفكي الزلالي (TMJ).",
      examTrivia: "العظمة الوحيدة المتحركة في عظام الوجه والجمجمة؛ تتيح حركة المضغ والكلام وتثبيت الأسنان السفلية.",
      landmarks: [
        { id: "mandible_condyle", name: "اللقمة الفكية (Condylar Process)", desc: "رأس مفصلي يستقر في الحفرة الفكية للعظم الصدغي", pos: [0.34, 0.22, -0.18], color: 0x00f0ff },
        { id: "coronoid_proc", name: "النتوء المنقاري (Coronoid Process)", desc: "موضع اندغام العضلة الصدغية القوية الرافعة للفك", pos: [0.3, 0.2, 0.02], color: 0xf59e0b },
        { id: "mandible_ramus", name: "فرع الفك الصاعد (Ramus)", desc: "صفيحة عظمية ترتكز عليها العضلة الماضغة من الخارج", pos: [0.32, 0.02, -0.08], color: 0x10b981 },
        { id: "mental_protub", name: "الذقن وجسم الفك (Mandibular Body)", desc: "قوس عظمي متين على شكل حدوة حصان يحمل الأسنان السفلية", pos: [0, -0.16, 0.28], color: 0x38bdf8 }
      ]
    },
    {
      id: "bone_sternum",
      name: "عظم القص المفلطح (Sternum)",
      category: "bone",
      badge: "عظمة مفلطحة • درع القفص الصدري",
      generator: "sternum",
      articulation: "تتصل بها الترقوتان من أعلى والأزواج السبعة الأولى من الضلوع مباشرة، والأزواج 8-10 غير مباشر.",
      examTrivia: "عظمة مفلطحة ومدببة من أسفل؛ جزؤها السفلي خنجري غضروفي (Xiphoid Process) يتعظم تدريجياً في سن البلوغ.",
      landmarks: [
        { id: "manubrium", name: "قبضة القص (Manubrium)", desc: "الجزء العلوي العريض المتصل بالترقوتين والزوج الأول من الضلوع", pos: [0, 0.32, 0.05], color: 0x00f0ff },
        { id: "sternal_angle", name: "زاوية القص (Angle of Louis)", desc: "بروز تشريحي هام يحدد موضع تمفصل الزوج الثاني من الضلوع", pos: [0, 0.18, 0.06], color: 0xa855f7 },
        { id: "sternum_body", name: "جسم القص (Sternal Body)", desc: "الجزء الأوسط المفلطح الذي تتصل به الضلوع من 3 إلى 7", pos: [0, -0.05, 0.04], color: 0x10b981 },
        { id: "xiphoid", name: "النتوء الخنجري الغضروفي (Xiphoid)", desc: "الجزء السفلي المدبب والغضروفي الذي يرتكز عليه الحجاب الحاجز", pos: [0, -0.32, 0.02], color: 0xf43f5e }
      ]
    },
    {
      id: "bone_rib_typical",
      name: "ضلع صدري حقيقي مقوس (Typical Rib)",
      category: "bone",
      badge: "عظمة مقوسة • حركة التنفس",
      generator: "rib",
      articulation: "يتمفصل من الخلف مع جسم الفقرة ونتوئها المستعرض، ومن الأمام مع عظم القص بواسطة غضروف ضلعي.",
      examTrivia: "عظمة مقوسة تنحني لأسفل وللأمام وتتحرك أثناء الشهيق للأمام والجانبين لزيادة الاتساع الصدري.",
      landmarks: [
        { id: "rib_head", name: "رأس الضلع (Head of Rib)", desc: "يتمفصل مع جسم فقرتين صدريتين متجاورتين والقرص بينهما", pos: [-0.35, 0.1, -0.2], color: 0x00f0ff },
        { id: "rib_tubercle", name: "حديبة الضلع (Tubercle)", desc: "تتمفصل مع النتوء المستعرض للفقرة الصدرية المماثلة في الرقم", pos: [-0.28, 0.08, -0.25], color: 0xa855f7 },
        { id: "rib_angle", name: "زاوية الضلع (Angle)", desc: "موضع انحناء الضلع للأمام والأسفل", pos: [-0.15, -0.02, -0.28], color: 0xf59e0b },
        { id: "costal_groove", name: "الميزاب الضلعي (Costal Groove)", desc: "أخدود بالسطح السفلي لحماية الحزمة الوعائية العصبية الوربية", pos: [0.1, -0.1, 0], color: 0x38bdf8 },
        { id: "anterior_end", name: "الطرف الأمامي للضلع", desc: "يتصل بالغضروف الضلعي المرن المؤدي لعظم القص", pos: [0.35, -0.15, 0.25], color: 0x10b981 }
      ]
    },
    {
      id: "bone_scapula",
      name: "عظم لوح الكتف (Scapula)",
      category: "bone",
      badge: "عظمة ظهرية مثلثة • التجويف الأروحي",
      generator: "scapula",
      articulation: "تتمفصل مع عظم الترقوة من أعلى ومع رأس عظم العضد في التجويف الأروحي.",
      examTrivia: "عظمة مثلثة ظهرية طرفها الداخلي عريض والخارجي مدبب به التجويف الأروحي لتكوين مفصل الكتف واسع الحركة.",
      landmarks: [
        { id: "glenoid_cavity", name: "التجويف الأروحي (Glenoid Cavity)", desc: "تجويف ضحل يستقر فيه رأس عظم العضد بمفصل زلالي واسع", pos: [0.32, 0.18, 0.05], color: 0xf43f5e },
        { id: "acromion", name: "النتوء الأخرمي (Acromion)", desc: "بروز علوي عريض يتمفصل مع الطرف الخارجي لعظم الترقوة", pos: [0.28, 0.32, -0.05], color: 0x00f0ff },
        { id: "coracoid", name: "النتوء الغرابي (Coracoid Process)", desc: "بروز خطافي أمامي لتثبيت أوتار العضلة ذات الرأسين والعضلة الصدرية", pos: [0.22, 0.25, 0.18], color: 0xa855f7 },
        { id: "scapular_spine", name: "شوكة لوح الكتف (Spine)", desc: "بروز عظمي بارز يقسم السطح الظهري لحفرتين عضلية", pos: [-0.05, 0.15, -0.1], color: 0xf59e0b },
        { id: "medial_border", name: "الحافة الداخلية العريضة", desc: "الحافة القريبة من العمود الفقري المرتكزة عليها عضلات الظهر", pos: [-0.35, -0.1, 0], color: 0x10b981 }
      ]
    },
    {
      id: "bone_clavicle",
      name: "عظم الترقوة الباطني (Clavicle)",
      category: "bone",
      badge: "عظمة باطنية رفيعة مزدوجة المنحنى",
      generator: "clavicle",
      articulation: "تتمفصل من الداخل مع قبضة عظم القص، ومن الخارج مع النتوء الأخرمي للوح الكتف.",
      examTrivia: "عظمة باطنية رفيعة ومنحنية على شكل حرف S تنقل القوى من الطرف العلوي إلى الهيكل المحوري.",
      landmarks: [
        { id: "sternal_end", name: "الطرف القصي الداخلي (Sternal End)", desc: "طرف مدور يتمفصل مع قبضة عظم القص", pos: [-0.45, 0, 0.05], color: 0x00f0ff },
        { id: "acromial_end", name: "الطرف الأخرمي الخارجي (Acromial End)", desc: "طرف مفلطح يتمفصل مع أخرم لوح الكتف", pos: [0.45, 0.05, -0.02], color: 0xf43f5e },
        { id: "shaft", name: "جسم الترقوة المزدوج الانحناء", desc: "موضع ارتكاز العضلة الدالية والصدرية الكبرى والقترائية", pos: [0, 0.02, 0.08], color: 0x10b981 }
      ]
    },
    {
      id: "bone_humerus",
      name: "عظم العضد (Humerus)",
      category: "bone",
      badge: "عظمة طويلة • مفصل الكتف والكوع",
      generator: "humerus",
      articulation: "يتمفصل رأسه العلوي مع التجويف الأروحي، وطرفه السفلي مع تجويف عظم الزند ورأس الكعبرة.",
      examTrivia: "رأسه يستقر في التجويف الأروحي، بينما طرفه السفلي يحتوي على لقمة وبكرة تتمفصل مع تجويف الزند لتشكيل مفصل الكوع.",
      landmarks: [
        { id: "humerus_head", name: "رأس العضد الكروي (Head)", desc: "سطح نصف كروي أملس يستقر في التجويف الأروحي", pos: [-0.08, 0.42, 0.02], color: 0x00f0ff },
        { id: "deltoid_tuberosity", name: "الحدبة الدالية (Deltoid Tuberosity)", desc: "بروز خشن في منتصف الجسم ترتكز فيه العضلة الدالية للكتف", pos: [0.08, 0.1, 0.06], color: 0xf59e0b },
        { id: "trochlea", name: "البكرة المفصلية (Trochlea)", desc: "بكرة سفلية تستقر بدقة في تجويف عظم الزند بمفصل الكوع", pos: [-0.04, -0.42, 0.02], color: 0xf43f5e },
        { id: "capitulum", name: "اللقيمة (Capitulum)", desc: "بروز كروي جانبي يتمفصل مع رأس عظم الكعبرة", pos: [0.08, -0.4, 0.04], color: 0xa855f7 },
        { id: "olecranon_fossa", name: "حفرة النتوء الزجي (Olecranon Fossa)", desc: "تجويف خلفي يستقر فيه النتوء الزجي للزند عند بسط الذراع", pos: [0, -0.38, -0.06], color: 0x38bdf8 }
      ]
    },
    {
      id: "bone_femur",
      name: "عظم الفخذ (Femur - أطول وأقوى عظمة)",
      category: "bone",
      badge: "الأطول والأثقل • التجويف الحقي",
      generator: "femur",
      articulation: "يستقر رأسه في التجويف الحقي العميق بالحوض، وطرفه السفلي يتمفصل مع القصبة والرضفة بمفصل الركبة.",
      examTrivia: "أطول وأثقل وأقوى عظمة في جسم الإنسان؛ يتحمل قوى ضغط هائلة تصل لعدة أضعاف وزن الجسم أثناء القفز.",
      landmarks: [
        { id: "femur_head", name: "رأس الفخذ الكروي (Head of Femur)", desc: "يستقر بعمق وثبات فائق داخل التجويف الحقي للحوض", pos: [-0.18, 0.44, 0.05], color: 0x00f0ff },
        { id: "femur_neck", name: "عنق الفخذ (Neck of Femur)", desc: "جسر عظمي ينقل وزن الجسم بزاوية ميكانيكية نحو جسم العظمة", pos: [-0.1, 0.38, 0.02], color: 0xa855f7 },
        { id: "greater_trochanter", name: "المدور الكبير (Greater Trochanter)", desc: "بروز عظمي جانبي ضخم ترتكز عليه عضلات الألوية القوية", pos: [0.15, 0.38, -0.02], color: 0xf59e0b },
        { id: "femur_shaft", name: "جسم الفخذ الأسطواني القوي", desc: "عمود أسطواني مقوس قليلاً للأمام لزيادة مرونة امتصاص الصدمات", pos: [0, 0, 0], color: 0x10b981 },
        { id: "medial_condyle", name: "اللقمة الإنسية (Medial Condyle)", desc: "سطح مفصلي غضروفي ضخم يرتكز على القصبة بمفصل الركبة", pos: [-0.1, -0.44, -0.02], color: 0xf43f5e },
        { id: "lateral_condyle", name: "اللقمة الوحشية (Lateral Condyle)", desc: "السطح المفصلي الخارجي مع القصبة وغضروف الركبة الهلالي", pos: [0.1, -0.44, -0.02], color: 0x38bdf8 },
        { id: "patellar_surface", name: "السطح الرضفي (Patellar Surface)", desc: "ميزاب أمامي أملس تنزلق عليه عظمة الرضفة أثناء ثني وبسط الركبة", pos: [0, -0.42, 0.08], color: 0xec4899 }
      ]
    },
    {
      id: "bone_patella",
      name: "عظمة الرضفة (Patella - صابونة الركبة)",
      category: "bone",
      badge: "عظمة سمسمية • حماية مفصل الركبة",
      generator: "patella",
      articulation: "تتمفصل مع السطح الرضفي لعظم الفخذ داخل وتر العضلة ذات الرؤوس الأربعة الفخذية.",
      examTrivia: "عظمة سمسمية صغيرة مستديرة تقع أمام مفصل الركبة وتعمل كعتلة لزيادة القوة الميكانيكية للوتر الباسط للركبة.",
      landmarks: [
        { id: "patella_base", name: "قاعدة الرضفة العلوية (Base)", desc: "موضع اندغام وتر العضلة رباعية الرؤوس الفخذية القوية", pos: [0, 0.2, 0.02], color: 0x00f0ff },
        { id: "patella_apex", name: "قمة الرضفة السفلية المدببة (Apex)", desc: "يتصل بها الرباط الرضفي المتجه إلى قصبة الساق", pos: [0, -0.22, 0.04], color: 0xf43f5e },
        { id: "articular_facets", name: "السطح المفصلي الخلفي الأملس", desc: "سطح مغطى بغضروف زجاجي سميك للانزلاق فوق بكرة الفخذ", pos: [0, 0, -0.08], color: 0xa855f7 }
      ]
    },
    {
      id: "bone_pelvis",
      name: "نصف الحزام الحوضي (Coxal / Innominate Bone)",
      category: "bone",
      badge: "حرقفة + ورك + عانة • التجويف الحقي",
      generator: "pelvis",
      articulation: "يتمفصل مع العجز من الخلف، ومع النصف المقابل في الارتفاق العاني، ومع رأس الفخذ في التجويف الحقي.",
      examTrivia: "يتكون كل نصف من التحام 3 عظام (الحرقفة الظهرية، والورك، والعانة الباطنية) ويلتقون في التجويف الحقي.",
      landmarks: [
        { id: "iliac_crest", name: "عرف الحرقفة الظهرية (Iliac Crest)", desc: "الحافة العلوية العريضة التي ترتكز عليها عضلات جدار البطن", pos: [0, 0.38, 0], color: 0x00f0ff },
        { id: "acetabulum", name: "التجويف الحقي العميق (Acetabulum)", desc: "تجويف عميق وكروي يتكون من التقاء العظام الثلاثة لاستقرار رأس الفخذ", pos: [0.08, -0.05, 0.18], color: 0xf43f5e },
        { id: "pubic_symphysis", name: "موضع الارتفاق العاني (Pubis)", desc: "موضع التحام نصفي الحوض من الأمام بغضروف ليفي مرن", pos: [-0.25, -0.28, 0.22], color: 0x10b981 },
        { id: "ischial_tuberosity", name: "حدبة الورك (Ischial Tuberosity)", desc: "البروز العظمي السميك الذي يرتكز عليه الجسم أثناء الجلوس", pos: [0.12, -0.38, -0.15], color: 0xf59e0b },
        { id: "obturator_foramen", name: "الثقب السدادي الكبير (Obturator Foramen)", desc: "ثقب بيضاوي ضخم لمرور الأوعية والأعصاب إلى الفخذ", pos: [-0.08, -0.25, 0.08], color: 0x38bdf8 }
      ]
    }
  ];

  window.BONE_REGISTRY = BONE_REGISTRY;

  let boneStudioScene, boneStudioCamera, boneStudioRenderer, boneStudioControls;
  let currentExtractedBoneIndex = 0;
  let currentStudioMeshGroup = null;
  let studioPinMeshes = [];
  let isStudioInitialized = false;
  let isStudioOpen = false;
  let isStudioRotating = false;
  let isStudioWireframe = false;
  let currentCategoryFilter = "all";

  const studioRaycaster = new THREE.Raycaster();
  const studioMouse = new THREE.Vector2();

  function disposeObject3D(obj) {
    if (!obj) return;
    obj.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
        else child.material.dispose();
      }
    });
  }

  function resizeStudioViewport() {
    const cont = document.getElementById("studio-canvas-container");
    if (!cont || !boneStudioRenderer || !boneStudioCamera) return;
    const rect = cont.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      boneStudioCamera.aspect = rect.width / rect.height;
      boneStudioCamera.updateProjectionMatrix();
      boneStudioRenderer.setSize(rect.width, rect.height);
    }
  }

  function initBoneStudio() {
    if (isStudioInitialized) return;
    const canvas = document.getElementById("bone-studio-canvas");
    const container = document.getElementById("studio-canvas-container") || (canvas ? canvas.parentElement : null);
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width > 0 ? rect.width : (container.clientWidth || 600);
    const height = rect.height > 0 ? rect.height : (container.clientHeight || 420);

    boneStudioScene = new THREE.Scene();
    boneStudioScene.background = new THREE.Color(0x030812);

    boneStudioCamera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);
    boneStudioCamera.position.set(0, 0.55, 2.15);

    boneStudioRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
    boneStudioRenderer.setSize(width, height);
    boneStudioRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    boneStudioRenderer.shadowMap.enabled = true;
    boneStudioRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    boneStudioRenderer.toneMappingExposure = 1.25;

    boneStudioControls = new THREE.OrbitControls(boneStudioCamera, boneStudioRenderer.domElement);
    boneStudioControls.enableDamping = true;
    boneStudioControls.dampingFactor = 0.06;
    boneStudioControls.maxDistance = 5.5;
    boneStudioControls.minDistance = 0.55;

    const ambientLight = new THREE.AmbientLight(0xe2e8f0, 1.15);
    boneStudioScene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.35);
    keyLight.position.set(3, 4, 3);
    keyLight.castShadow = true;
    boneStudioScene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.45);
    fillLight.position.set(-3, 1.2, -2);
    boneStudioScene.add(fillLight);

    const bottomRim = new THREE.DirectionalLight(0x06b6d4, 0.95);
    bottomRim.position.set(0, -3, 2);
    boneStudioScene.add(bottomRim);

    const grid = new THREE.GridHelper(3.8, 18, 0x0e7490, 0x0f172a);
    grid.position.y = -0.68;
    if (grid.material) {
      grid.material.transparent = true;
      grid.material.opacity = 0.35;
    }
    boneStudioScene.add(grid);

    currentStudioMeshGroup = new THREE.Group();
    boneStudioScene.add(currentStudioMeshGroup);

    // Direct 3D Raycast click on anatomical landmark pins
    let downX = 0, downY = 0;
    canvas.addEventListener("pointerdown", (e) => {
      downX = e.clientX;
      downY = e.clientY;
    });
    canvas.addEventListener("pointerup", (e) => {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return;
      if (!studioPinMeshes.length) return;
      const r = canvas.getBoundingClientRect();
      studioMouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      studioMouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      studioRaycaster.setFromCamera(studioMouse, boneStudioCamera);
      const hits = studioRaycaster.intersectObjects(studioPinMeshes, false);
      if (hits.length > 0 && hits[0].object.userData && hits[0].object.userData.landmark) {
        const hitPin = hits[0].object;
        highlightLandmarkInStudio(hitPin.userData.landmark, hitPin, hitPin.userData.btnEl);
      }
    });

    canvas.addEventListener("pointermove", (e) => {
      if (!isStudioOpen || !studioPinMeshes.length) return;
      const r = canvas.getBoundingClientRect();
      studioMouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      studioMouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      studioRaycaster.setFromCamera(studioMouse, boneStudioCamera);
      const hits = studioRaycaster.intersectObjects(studioPinMeshes, false);
      canvas.style.cursor = hits.length > 0 ? "pointer" : "grab";
    });

    function studioAnimate() {
      requestAnimationFrame(studioAnimate);
      if (!isStudioOpen) return;
      if (isStudioRotating && currentStudioMeshGroup) {
        currentStudioMeshGroup.rotation.y += 0.011;
      }
      if (boneStudioControls) boneStudioControls.update();
      if (boneStudioRenderer && boneStudioScene && boneStudioCamera) {
        boneStudioRenderer.render(boneStudioScene, boneStudioCamera);
      }
    }
    studioAnimate();

    window.addEventListener("resize", () => {
      if (isStudioOpen) resizeStudioViewport();
    });

    isStudioInitialized = true;
  }

  function createBone3DGeometry(generatorType) {
    const boneMat = new THREE.MeshStandardMaterial({
      color: 0xfbf8ee,
      roughness: 0.36,
      metalness: 0.06,
      wireframe: isStudioWireframe
    });

    const group = new THREE.Group();

    switch (generatorType) {
      case "atlas": {
        const ringGeo = new THREE.TorusGeometry(0.32, 0.09, 20, 48);
        ringGeo.scale(1.2, 0.75, 1.0);
        const ringMesh = new THREE.Mesh(ringGeo, boneMat);
        ringMesh.rotation.x = Math.PI / 2;
        group.add(ringMesh);

        [-0.28, 0.28].forEach((x) => {
          const facet = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.06, 24), boneMat);
          facet.position.set(x, 0.07, 0.05);
          group.add(facet);
        });

        [-0.45, 0.45].forEach((x) => {
          const trans = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 16), boneMat);
          trans.position.set(x, -0.02, 0);
          trans.rotation.z = x > 0 ? -Math.PI / 2 : Math.PI / 2;
          group.add(trans);
        });
        break;
      }

      case "axis": {
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.22, 32), boneMat);
        body.position.set(0, -0.12, 0.15);
        group.add(body);

        const dens = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.32, 24), boneMat);
        dens.position.set(0, 0.18, 0.12);
        group.add(dens);

        const densCap = new THREE.Mesh(new THREE.SphereGeometry(0.08, 20, 20), boneMat);
        densCap.position.set(0, 0.34, 0.12);
        group.add(densCap);

        const arch = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.07, 16, 32), boneMat);
        arch.rotation.x = Math.PI / 2;
        arch.position.set(0, -0.05, -0.05);
        group.add(arch);

        const spin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.15, 0.32), boneMat);
        spin.position.set(0, -0.06, -0.32);
        spin.rotation.x = -0.25;
        group.add(spin);

        [-0.07, 0.07].forEach((x) => {
          const tip = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.1, 12), boneMat);
          tip.position.set(x, -0.08, -0.46);
          tip.rotation.x = -Math.PI / 2;
          group.add(tip);
        });
        break;
      }

      case "vertebra_thoracic": {
        const bodyGeo = new THREE.CylinderGeometry(0.25, 0.28, 0.26, 32);
        bodyGeo.scale(1.1, 1, 1.25);
        const body = new THREE.Mesh(bodyGeo, boneMat);
        body.position.set(0, -0.15, 0.24);
        group.add(body);

        const arch = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.06, 16, 32), boneMat);
        arch.rotation.x = Math.PI / 2;
        arch.position.set(0, -0.05, 0.02);
        group.add(arch);

        const spin = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.52, 16), boneMat);
        spin.position.set(0, -0.22, -0.35);
        spin.rotation.x = -1.1;
        group.add(spin);

        [-0.38, 0.38].forEach((x) => {
          const trans = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.28, 16), boneMat);
          trans.position.set(x, 0.02, -0.05);
          trans.rotation.z = x > 0 ? -1.2 : 1.2;
          trans.rotation.y = x > 0 ? -0.3 : 0.3;
          group.add(trans);
        });

        [-0.16, 0.16].forEach((x) => {
          const supFacet = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.1, 0.06), boneMat);
          supFacet.position.set(x, 0.16, -0.08);
          group.add(supFacet);

          const infFacet = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.1, 0.06), boneMat);
          infFacet.position.set(x, -0.22, -0.15);
          group.add(infFacet);
        });
        break;
      }

      case "vertebra_lumbar": {
        const bodyGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.34, 36);
        bodyGeo.scale(1.25, 1, 1.05);
        const body = new THREE.Mesh(bodyGeo, boneMat);
        body.position.set(0, -0.18, 0.26);
        group.add(body);

        const arch = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.08, 20, 36), boneMat);
        arch.rotation.x = Math.PI / 2;
        arch.position.set(0, -0.05, -0.02);
        group.add(arch);

        const spin = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.28, 0.36), boneMat);
        spin.position.set(0, -0.05, -0.42);
        spin.rotation.x = -0.15;
        group.add(spin);

        [-0.48, 0.48].forEach((x) => {
          const trans = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.12, 0.12), boneMat);
          trans.position.set(x, 0.02, 0.02);
          trans.rotation.z = x > 0 ? -0.2 : 0.2;
          group.add(trans);
        });

        [-0.2, 0.2].forEach((x) => {
          const supFacet = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.14, 16), boneMat);
          supFacet.position.set(x, 0.22, -0.12);
          group.add(supFacet);

          const infFacet = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.14, 16), boneMat);
          infFacet.position.set(x, -0.26, -0.2);
          group.add(infFacet);
        });
        break;
      }

      case "sacrum": {
        const sacrumGeo = new THREE.ConeGeometry(0.48, 0.82, 32);
        sacrumGeo.scale(1.2, 1, 0.45);
        const sacrumMesh = new THREE.Mesh(sacrumGeo, boneMat);
        sacrumMesh.rotation.x = Math.PI;
        sacrumMesh.position.set(0, 0.05, 0);
        group.add(sacrumMesh);

        const promontory = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.3, 0.12, 24), boneMat);
        promontory.scale.set(1.3, 1, 0.8);
        promontory.position.set(0, 0.34, 0.08);
        group.add(promontory);

        const holeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9, wireframe: isStudioWireframe });
        [-0.15, 0.15].forEach((x) => {
          [0.2, 0.08, -0.04, -0.16].forEach((y) => {
            const hole = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), holeMat);
            hole.position.set(x, y, 0.14);
            group.add(hole);
          });
        });
        break;
      }

      case "coccyx": {
        [0, 1, 2, 3].forEach((i) => {
          const scale = 0.14 - i * 0.025;
          const piece = new THREE.Mesh(new THREE.SphereGeometry(scale, 16, 16), boneMat);
          piece.scale.set(1.4, 0.8, 0.8);
          piece.position.set(0, 0.15 - i * 0.1, 0);
          group.add(piece);
        });
        break;
      }

      case "mandible": {
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.34, -0.08, -0.12),
          new THREE.Vector3(-0.26, -0.16, 0.12),
          new THREE.Vector3(0, -0.18, 0.28),
          new THREE.Vector3(0.26, -0.16, 0.12),
          new THREE.Vector3(0.34, -0.08, -0.12)
        ]);
        const bodyArch = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.065, 16, false), boneMat);
        group.add(bodyArch);

        [-0.32, 0.32].forEach((x) => {
          const ramus = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.34, 0.16), boneMat);
          ramus.position.set(x, 0.06, -0.1);
          ramus.rotation.x = 0.22;
          group.add(ramus);

          const condyle = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), boneMat);
          condyle.scale.set(1.2, 0.9, 0.9);
          condyle.position.set(x * 1.05, 0.23, -0.18);
          group.add(condyle);

          const coronoid = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 12), boneMat);
          coronoid.position.set(x * 0.95, 0.21, 0.01);
          group.add(coronoid);
        });
        break;
      }

      case "sternum": {
        const manubrium = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.22, 0.08), boneMat);
        manubrium.position.set(0, 0.3, 0.04);
        group.add(manubrium);

        const body = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.46, 0.07), boneMat);
        body.position.set(0, -0.04, 0.03);
        group.add(body);

        const xiphoidMat = new THREE.MeshStandardMaterial({
          color: 0x93c5fd,
          roughness: 0.2,
          metalness: 0.1,
          transparent: true,
          opacity: 0.85,
          wireframe: isStudioWireframe
        });
        const xiphoid = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.2, 16), xiphoidMat);
        xiphoid.rotation.x = Math.PI;
        xiphoid.position.set(0, -0.36, 0.02);
        group.add(xiphoid);
        break;
      }

      case "rib": {
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.35, 0.12, -0.2),
          new THREE.Vector3(-0.25, 0.05, -0.28),
          new THREE.Vector3(0, -0.02, -0.22),
          new THREE.Vector3(0.25, -0.08, 0.05),
          new THREE.Vector3(0.35, -0.15, 0.26)
        ]);
        const ribMesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.045, 12, false), boneMat);
        group.add(ribMesh);

        const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), boneMat);
        headMesh.position.set(-0.35, 0.12, -0.2);
        group.add(headMesh);
        break;
      }

      case "scapula": {
        const bladeGeo = new THREE.ConeGeometry(0.48, 0.72, 3);
        bladeGeo.scale(1.1, 1, 0.12);
        const blade = new THREE.Mesh(bladeGeo, boneMat);
        blade.rotation.z = Math.PI;
        blade.position.set(-0.08, -0.08, 0);
        group.add(blade);

        const glenoid = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.08, 24), boneMat);
        glenoid.position.set(0.3, 0.18, 0.04);
        glenoid.rotation.z = -Math.PI / 4;
        group.add(glenoid);

        const acromion = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.12), boneMat);
        acromion.position.set(0.24, 0.32, -0.05);
        group.add(acromion);

        const coracoid = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.18, 16), boneMat);
        coracoid.position.set(0.18, 0.24, 0.14);
        coracoid.rotation.x = Math.PI / 3;
        group.add(coracoid);
        break;
      }

      case "clavicle": {
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.46, 0, 0.04),
          new THREE.Vector3(-0.2, 0.04, 0.12),
          new THREE.Vector3(0.15, -0.02, 0.02),
          new THREE.Vector3(0.46, 0.05, -0.06)
        ]);
        const clavMesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.055, 16, false), boneMat);
        group.add(clavMesh);
        break;
      }

      case "humerus": {
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.78, 24), boneMat);
        group.add(shaft);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 24), boneMat);
        head.position.set(-0.08, 0.4, 0.02);
        group.add(head);

        const tub = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), boneMat);
        tub.position.set(0.08, 0.38, -0.02);
        group.add(tub);

        const condyle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.22, 20), boneMat);
        condyle.rotation.z = Math.PI / 2;
        condyle.position.set(0, -0.42, 0);
        group.add(condyle);
        break;
      }

      case "femur": {
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.88, 28), boneMat);
        group.add(shaft);

        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.24, 20), boneMat);
        neck.position.set(-0.1, 0.38, 0.02);
        neck.rotation.z = 0.65;
        group.add(neck);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 28, 28), boneMat);
        head.position.set(-0.18, 0.44, 0.04);
        group.add(head);

        const trochanter = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.2, 0.16), boneMat);
        trochanter.position.set(0.14, 0.38, -0.02);
        group.add(trochanter);

        [-0.1, 0.1].forEach((x) => {
          const condyle = new THREE.Mesh(new THREE.SphereGeometry(0.12, 20, 20), boneMat);
          condyle.scale.set(1, 1.2, 1.4);
          condyle.position.set(x, -0.44, -0.02);
          group.add(condyle);
        });
        break;
      }

      case "patella": {
        const patellaGeo = new THREE.SphereGeometry(0.24, 28, 28);
        patellaGeo.scale(1.1, 1.2, 0.45);
        group.add(new THREE.Mesh(patellaGeo, boneMat));
        break;
      }

      case "pelvis": {
        const ilium = new THREE.Mesh(new THREE.SphereGeometry(0.42, 28, 28), boneMat);
        ilium.scale.set(1.2, 0.9, 0.16);
        ilium.position.set(0, 0.22, 0);
        group.add(ilium);

        const acetabulum = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.05, 16, 28), boneMat);
        acetabulum.position.set(0.08, -0.05, 0.15);
        group.add(acetabulum);

        const pubicRing = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.05, 16, 28), boneMat);
        pubicRing.position.set(-0.06, -0.28, 0.06);
        pubicRing.rotation.x = 0.4;
        group.add(pubicRing);
        break;
      }

      default: {
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.32, 0.24, 32), boneMat);
        body.position.set(0, -0.12, 0.22);
        group.add(body);

        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.06, 16, 32), boneMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.set(0, -0.05, 0);
        group.add(ring);

        const spin = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.36, 16), boneMat);
        spin.position.set(0, -0.1, -0.35);
        spin.rotation.x = -0.8;
        group.add(spin);

        [-0.38, 0.38].forEach((x) => {
          const trans = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.24, 16), boneMat);
          trans.position.set(x, 0, 0.04);
          trans.rotation.z = x > 0 ? -Math.PI / 2 : Math.PI / 2;
          group.add(trans);
        });
        break;
      }
    }

    return group;
  }

  function populateBoneSelectorDropdown(catFilter) {
    const filter = catFilter || currentCategoryFilter || "all";
    const select = document.getElementById("studio-bone-select");
    if (!select) return;
    select.innerHTML = "";

    const vertOptGroup = document.createElement("optgroup");
    vertOptGroup.label = "── فقرات العمود الفقري (33 فقرة) ──";

    const boneOptGroup = document.createElement("optgroup");
    boneOptGroup.label = "── عظام الهيكل المحوري والطرفي ──";

    BONE_REGISTRY.forEach((b) => {
      if (filter !== "all" && b.category !== filter) return;
      const opt = document.createElement("option");
      opt.value = b.id;
      opt.innerText = b.name;
      if (b.category === "vertebra") vertOptGroup.appendChild(opt);
      else boneOptGroup.appendChild(opt);
    });

    if (vertOptGroup.children.length > 0) select.appendChild(vertOptGroup);
    if (boneOptGroup.children.length > 0) select.appendChild(boneOptGroup);
  }

  function filterExtractionCategory(cat) {
    currentCategoryFilter = cat || "all";
    document.querySelectorAll("[data-bone-cat]").forEach((btn) => {
      const active = btn.getAttribute("data-bone-cat") === currentCategoryFilter;
      btn.classList.toggle("bg-sky-500/20", active);
      btn.classList.toggle("text-sky-300", active);
      btn.classList.toggle("border-sky-400/50", active);
      btn.classList.toggle("text-slate-400", !active);
      btn.classList.toggle("border-slate-800", !active);
    });

    populateBoneSelectorDropdown(currentCategoryFilter);
    const filtered = BONE_REGISTRY.filter((b) => currentCategoryFilter === "all" || b.category === currentCategoryFilter);
    if (filtered.length > 0) {
      loadExtractedBoneById(filtered[0].id);
    }
  }

  function setLandmarkButtonActive(activeBtn) {
    const landmarkList = document.getElementById("studio-landmarks-container");
    if (!landmarkList) return;
    landmarkList.querySelectorAll("button").forEach((b) => {
      const on = b === activeBtn;
      b.classList.toggle("border-sky-400/70", on);
      b.classList.toggle("bg-sky-500/15", on);
      b.classList.toggle("border-slate-800/90", !on);
      b.classList.toggle("bg-slate-900/80", !on);
    });
  }

  function highlightLandmarkInStudio(landmark, pinMesh, btnEl) {
    const activeTitle = document.getElementById("landmark-detail-title");
    if (activeTitle) activeTitle.innerText = landmark.name;
    const activeDesc = document.getElementById("landmark-detail-desc");
    if (activeDesc) activeDesc.innerText = landmark.desc;

    if (btnEl) setLandmarkButtonActive(btnEl);

    if (!pinMesh || !boneStudioControls || !boneStudioCamera) return;

    // Ensure group rotation is aligned so landmark local coordinates match camera focus
    if (currentStudioMeshGroup) {
      gsap.to(currentStudioMeshGroup.rotation, { x: 0, y: 0, z: 0, duration: 0.55, ease: "power2.out" });
    }

    gsap.to(boneStudioControls.target, {
      x: landmark.pos[0],
      y: landmark.pos[1],
      z: landmark.pos[2],
      duration: 0.75,
      ease: "power2.inOut",
      onUpdate: () => boneStudioControls.update()
    });

    gsap.to(boneStudioCamera.position, {
      x: landmark.pos[0] + 0.16,
      y: landmark.pos[1] + 0.14,
      z: landmark.pos[2] + 0.82,
      duration: 0.75,
      ease: "power2.inOut"
    });

    gsap.fromTo(
      pinMesh.scale,
      { x: 1, y: 1, z: 1 },
      { x: 2.15, y: 2.15, z: 2.15, duration: 0.22, yoyo: true, repeat: 3 }
    );
  }

  function loadExtractedBoneById(boneId) {
    if (!BONE_REGISTRY || BONE_REGISTRY.length === 0) return;
    let boneIndex = BONE_REGISTRY.findIndex((b) => b.id === boneId);
    if (boneIndex === -1) boneIndex = 0;
    currentExtractedBoneIndex = boneIndex;
    const bone = BONE_REGISTRY[boneIndex];

    const titleEl = document.getElementById("studio-bone-title");
    if (titleEl) titleEl.innerText = bone.name;

    const badgeEl = document.getElementById("studio-bone-badge");
    if (badgeEl) badgeEl.innerText = bone.badge;

    const categoryEl = document.getElementById("studio-bone-category");
    if (categoryEl) {
      categoryEl.innerText =
        bone.category === "vertebra"
          ? "العمود الفقري • دراسة تشريحية للفقرة المستخرجة"
          : "الهيكل العظمي • دراسة تشريحية للعظمة المستخرجة";
    }

    const counterEl = document.getElementById("studio-bone-counter");
    if (counterEl) counterEl.innerText = `${boneIndex + 1} / ${BONE_REGISTRY.length}`;

    const articEl = document.getElementById("studio-articulation-desc");
    if (articEl) articEl.innerText = bone.articulation;

    const triviaEl = document.getElementById("studio-exam-trivia");
    if (triviaEl) triviaEl.innerText = bone.examTrivia;

    const select = document.getElementById("studio-bone-select");
    if (select) {
      if (!Array.from(select.options).some((o) => o.value === bone.id)) {
        currentCategoryFilter = "all";
        populateBoneSelectorDropdown("all");
      }
      select.value = bone.id;
    }

    if (currentStudioMeshGroup) {
      while (currentStudioMeshGroup.children.length > 0) {
        const child = currentStudioMeshGroup.children[0];
        currentStudioMeshGroup.remove(child);
        disposeObject3D(child);
      }
    }
    studioPinMeshes = [];

    const newBone3D = createBone3DGeometry(bone.generator);
    if (currentStudioMeshGroup) {
      currentStudioMeshGroup.add(newBone3D);
      currentStudioMeshGroup.rotation.set(0, 0, 0);
    }

    const landmarkList = document.getElementById("studio-landmarks-container");
    if (landmarkList) {
      landmarkList.innerHTML = "";

      if (bone.landmarks && bone.landmarks.length > 0) {
        const firstLm = bone.landmarks[0];
        const activeTitle = document.getElementById("landmark-detail-title");
        if (activeTitle) activeTitle.innerText = firstLm.name;
        const activeDesc = document.getElementById("landmark-detail-desc");
        if (activeDesc) activeDesc.innerText = firstLm.desc;

        bone.landmarks.forEach((lm, idx) => {
          const pinGeo = new THREE.SphereGeometry(0.036, 16, 16);
          const pinMat = new THREE.MeshStandardMaterial({
            color: lm.color || 0x00f0ff,
            emissive: lm.color || 0x00f0ff,
            emissiveIntensity: 0.85,
            roughness: 0.15
          });
          const pinMesh = new THREE.Mesh(pinGeo, pinMat);
          pinMesh.position.set(lm.pos[0], lm.pos[1], lm.pos[2]);

          const haloGeo = new THREE.RingGeometry(0.048, 0.068, 24);
          const haloMat = new THREE.MeshBasicMaterial({
            color: lm.color || 0x00f0ff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.65
          });
          const haloMesh = new THREE.Mesh(haloGeo, haloMat);
          haloMesh.position.set(lm.pos[0], lm.pos[1], lm.pos[2]);
          haloMesh.userData = { isLandmark: true };

          const lmBtn = document.createElement("button");
          lmBtn.type = "button";
          lmBtn.className =
            "p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-sky-400/60 text-right transition-all group flex items-center gap-2";
          lmBtn.innerHTML = `
            <span class="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style="background-color: #${(lm.color || 0x00f0ff).toString(16).padStart(6, "0")}"></span>
            <span class="font-semibold text-xs text-slate-200 group-hover:text-sky-200 truncate">${lm.name}</span>
          `;

          pinMesh.userData = { landmark: lm, isLandmark: true, btnEl: lmBtn };
          lmBtn.onclick = () => highlightLandmarkInStudio(lm, pinMesh, lmBtn);

          if (currentStudioMeshGroup) {
            currentStudioMeshGroup.add(pinMesh);
            currentStudioMeshGroup.add(haloMesh);
          }
          studioPinMeshes.push(pinMesh);
          landmarkList.appendChild(lmBtn);

          if (idx === 0) setLandmarkButtonActive(lmBtn);
        });
      }
    }

    if (boneStudioControls && boneStudioCamera) {
      gsap.to(boneStudioCamera.position, { x: 0, y: 0.5, z: 2.05, duration: 0.7, ease: "power2.out" });
      gsap.to(boneStudioControls.target, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.7,
        ease: "power2.out",
        onUpdate: () => boneStudioControls.update()
      });
    }
  }

  function openBoneExtractionStudio(preferredBoneId) {
    const modal = document.getElementById("bone-extraction-modal");
    if (!modal) return;
    modal.classList.remove("hidden");
    isStudioOpen = true;

    initBoneStudio();
    populateBoneSelectorDropdown(currentCategoryFilter);

    const selectedItem = window.getCurrentSelectedItem ? window.getCurrentSelectedItem() : null;
    const targetId =
      preferredBoneId ||
      (selectedItem && selectedItem.boneId) ||
      (BONE_REGISTRY[currentExtractedBoneIndex] ? BONE_REGISTRY[currentExtractedBoneIndex].id : "vert_c1_atlas");

    loadExtractedBoneById(targetId);

    requestAnimationFrame(() => {
      resizeStudioViewport();
      setTimeout(resizeStudioViewport, 90);
    });
  }

  function closeBoneExtractionStudio() {
    const modal = document.getElementById("bone-extraction-modal");
    if (modal) modal.classList.add("hidden");
    isStudioOpen = false;
  }

  function toggleStudioAutoRotate() {
    isStudioRotating = !isStudioRotating;
    const btn = document.getElementById("btn-studio-rotate");
    if (btn) {
      btn.classList.toggle("bg-sky-500/25", isStudioRotating);
      btn.classList.toggle("text-sky-200", isStudioRotating);
      btn.classList.toggle("border-sky-400/60", isStudioRotating);
    }
  }

  function toggleStudioWireframe() {
    isStudioWireframe = !isStudioWireframe;
    const btn = document.getElementById("btn-studio-wireframe");
    if (btn) {
      btn.classList.toggle("bg-cyan-500/25", isStudioWireframe);
      btn.classList.toggle("text-cyan-200", isStudioWireframe);
      btn.classList.toggle("border-cyan-400/60", isStudioWireframe);
    }
    if (currentStudioMeshGroup) {
      currentStudioMeshGroup.traverse((child) => {
        if (child.isMesh && child.material && !child.userData.isLandmark) {
          child.material.wireframe = isStudioWireframe;
        }
      });
    }
  }

  function resetStudioCamera() {
    if (!boneStudioControls || !boneStudioCamera) return;
    if (currentStudioMeshGroup) {
      gsap.to(currentStudioMeshGroup.rotation, { x: 0, y: 0, z: 0, duration: 0.6, ease: "power2.out" });
    }
    gsap.to(boneStudioCamera.position, { x: 0, y: 0.5, z: 2.05, duration: 0.75, ease: "power2.out" });
    gsap.to(boneStudioControls.target, {
      x: 0,
      y: 0,
      z: 0,
      duration: 0.75,
      ease: "power2.out",
      onUpdate: () => boneStudioControls.update()
    });
  }

  function navigateExtractedBone(direction) {
    if (!BONE_REGISTRY.length) return;
    currentExtractedBoneIndex = (currentExtractedBoneIndex + direction + BONE_REGISTRY.length) % BONE_REGISTRY.length;
    loadExtractedBoneById(BONE_REGISTRY[currentExtractedBoneIndex].id);
  }

  function extractCurrentBone() {
    const selectedItem = window.getCurrentSelectedItem ? window.getCurrentSelectedItem() : null;
    let targetId = null;
    if (selectedItem) {
      if (selectedItem.boneId) {
        targetId = selectedItem.boneId;
      } else {
        const match = BONE_REGISTRY.find(
          (b) =>
            b.name.includes(selectedItem.name) ||
            (selectedItem.keys && selectedItem.keys.some((k) => b.id.includes(k)))
        );
        if (match) targetId = match.id;
      }
    }
    openBoneExtractionStudio(targetId);
  }

  window.initBoneStudio = initBoneStudio;
  window.openBoneExtractionStudio = openBoneExtractionStudio;
  window.closeBoneExtractionStudio = closeBoneExtractionStudio;
  window.populateBoneSelectorDropdown = populateBoneSelectorDropdown;
  window.filterExtractionCategory = filterExtractionCategory;
  window.loadExtractedBoneById = loadExtractedBoneById;
  window.highlightLandmarkInStudio = highlightLandmarkInStudio;
  window.toggleStudioAutoRotate = toggleStudioAutoRotate;
  window.toggleStudioWireframe = toggleStudioWireframe;
  window.resetStudioCamera = resetStudioCamera;
  window.resetBoneStudioCamera = resetStudioCamera;
  window.navigateExtractedBone = navigateExtractedBone;
  window.extractCurrentBone = extractCurrentBone;
})();
