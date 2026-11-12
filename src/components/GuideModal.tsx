import React from 'react';
import {
  X,
  Rotate3d,
  MousePointer,
  Maximize,
  Move,
  Stethoscope,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/15 text-teal-300 border border-teal-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                دليل استخدام أطلس الأحياء التفاعلي
              </h3>
              <p className="text-xs text-slate-400">
                كيفية التفاعل مع النماذج ثلاثية الأبعاد والأدوات التعليمية
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300">
          {/* Navigation Controls */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h4 className="font-bold text-teal-300 flex items-center gap-2">
              <Rotate3d className="w-4 h-4" />
              <span>التحكم والحركة في الفضاء ثلاثي الأبعاد (3D Controls)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center space-y-1">
                <MousePointer className="w-4 h-4 text-teal-400 mx-auto" />
                <p className="font-semibold text-slate-200">تدوير 360°</p>
                <p className="text-[11px] text-slate-400">سحب بالزر الأيسر للفأرة أو لمس بإصبع واحد</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center space-y-1">
                <Maximize className="w-4 h-4 text-sky-400 mx-auto" />
                <p className="font-semibold text-slate-200">التركيز والتكبير</p>
                <p className="text-[11px] text-slate-400">انقر على أي عضو للتركيز والتقريب التلقائي، واضغط رجوع لاستعادة الهيكل بالكامل</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center space-y-1">
                <Move className="w-4 h-4 text-amber-400 mx-auto" />
                <p className="font-semibold text-slate-200">تحريك المشهد (Pan)</p>
                <p className="text-[11px] text-slate-400">سحب بالزر الأيمن للفأرة أو لمس بإصبعين</p>
              </div>
            </div>
          </div>

          {/* Biological Systems */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
            <h4 className="font-bold text-sky-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>الأنظمة الحيوية الثلاثة المتاحة:</span>
            </h4>

            <ul className="space-y-2 pr-1">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                <div>
                  <strong className="text-amber-200">1. الهيكل العظمي (Skeletal System):</strong> استكشاف عظام الجمجمة، القفص الصدري، العمود الفقري، الحوض، وعظام الأطراف مع تفاصيل تكوينها وإصاباتها السريرية.
                </div>
              </li>

              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                <div>
                  <strong className="text-rose-300">2. الجهاز العضلي (Muscular System):</strong> استعراض المجموعات العضلية الأساسية (الصدر، الكتف، البايسبس، الترايسبس، البطن، الفخذ والسمانة) وميكانيكا الحركة.
                </div>
              </li>

              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0 mt-1.5" />
                <div>
                  <strong className="text-sky-300">3. الجهاز العصبي (Nervous System):</strong> استكشاف نصفي المخ والمخيخ وجذع الدماغ والحبل الشوكي وتفرعات الأعصاب الطرفية مع نبضات كهربية محاكية لجهد الفعل (Action Potential).
                </div>
              </li>
            </ul>
          </div>

          {/* Tips */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="font-bold text-emerald-300 flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              <span>ميزات تعليمية متقدمة</span>
            </h4>
            <p className="text-slate-300 leading-relaxed">
              • انقر على أي جزء في النموذج لعرض <strong className="text-teal-300">بطاقة المعلومات الطبية الكاملة</strong> لشرح وظائف الأعضاء وتفاصيلها التشريحية والسريرية باللغتين العربية واللاتينية.<br/>
              • استخدم زر <strong className="text-teal-300">أشعة X</strong> لرؤية الأعضاء الداخلية الشفافة وتداخل العظام والأعصاب.<br/>
              • اختبر تحصيلك العلمي عبر زر <strong className="text-emerald-300">اختبار المعرفة</strong> لمطابقة الأسئلة مع التركيب ثلاثي الأبعاد.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors"
          >
            فهمت، ابدأ الاستكشاف
          </button>
        </div>
      </div>
    </div>
  );
};
