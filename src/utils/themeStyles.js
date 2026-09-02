/**
 * Returns CSS color themes for reader components.
 */.
export const getThemeStyles = (theme) => {
    switch (theme) {
        case 'minimalist':
            return {
                text: 'text-gray-400',
                highlight: 'text-gray-900 bg-yellow-100 font-bold',
                bg: 'bg-white',
                nav: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                textMain: 'text-gray-900',
                textMuted: 'text-gray-500',
                border: 'border-gray-200',
                cardBg: 'bg-gray-50/85 border-gray-200 shadow-sm',
                badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
                tipBg: 'bg-yellow-50 text-yellow-800 border-yellow-200',
                accentText: 'text-blue-600',
                buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20'
            };
        case 'cinematic':
            return {
                text: 'text-slate-400',
                highlight: 'text-white bg-blue-900/50 font-bold shadow-[0_0_10px_rgba(59,130,246,0.5)]',
                bg: 'bg-gradient-to-br from-gray-950 via-slate-900 to-indigo-950',
                nav: 'bg-white/10 text-white hover:bg-white/20',
                textMain: 'text-white',
                textMuted: 'text-slate-400',
                border: 'border-slate-800',
                cardBg: 'bg-slate-900/60 backdrop-blur-md border-slate-800 shadow-xl shadow-slate-950/20',
                badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                tipBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                accentText: 'text-blue-400',
                buttonPrimary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/40 hover:shadow-blue-500/50'
            };
        case 'zen':
            return {
                text: 'text-stone-400',
                highlight: 'text-stone-900 bg-stone-200 font-bold',
                bg: 'bg-[#f5f5f4]',
                nav: 'bg-stone-200 text-stone-600 hover:bg-stone-300',
                textMain: 'text-stone-800',
                textMuted: 'text-stone-500',
                border: 'border-stone-200',
                cardBg: 'bg-stone-100 border-stone-200 shadow-sm',
                badgeBg: 'bg-stone-200 text-stone-700 border-stone-300',
                tipBg: 'bg-orange-100/50 text-orange-800 border-orange-200',
                accentText: 'text-stone-700',
                buttonPrimary: 'bg-stone-800 hover:bg-stone-700 text-white shadow-lg shadow-stone-800/10'
            };
        case 'professional':
            return {
                text: 'text-gray-600',
                highlight: 'text-blue-900 bg-blue-50 font-bold',
                bg: 'bg-slate-50/80',
                nav: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
                textMain: 'text-slate-900',
                textMuted: 'text-slate-500',
                border: 'border-slate-200',
                cardBg: 'bg-white border-slate-200 shadow-sm',
                badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
                tipBg: 'bg-yellow-50 text-yellow-800 border-yellow-200',
                accentText: 'text-blue-700',
                buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
            };
        case 'vintage':
            return {
                text: 'text-amber-700',
                highlight: 'text-amber-900 bg-amber-100 font-bold',
                bg: 'bg-[#f7f2e8]',
                nav: 'bg-amber-200 text-amber-800 hover:bg-amber-300',
                textMain: 'text-amber-950',
                textMuted: 'text-amber-800/70',
                border: 'border-amber-200',
                cardBg: 'bg-amber-100/30 border-amber-200 shadow-sm',
                badgeBg: 'bg-amber-200/50 text-amber-900 border-amber-300/50',
                tipBg: 'bg-amber-200/30 text-amber-900 border-amber-300/40',
                accentText: 'text-amber-800',
                buttonPrimary: 'bg-amber-800 hover:bg-amber-700 text-[#f7f2e8] shadow-lg'
            };
        case 'focus':
            return {
                text: 'text-red-600',
                highlight: 'text-red-900 bg-red-100 font-bold',
                bg: 'bg-red-50/50',
                nav: 'bg-red-200 text-red-700 hover:bg-red-300',
                textMain: 'text-red-950',
                textMuted: 'text-red-800/70',
                border: 'border-red-200',
                cardBg: 'bg-white border-red-200/80 shadow-sm',
                badgeBg: 'bg-red-100 text-red-800 border-red-200',
                tipBg: 'bg-yellow-50 text-yellow-800 border-yellow-200',
                accentText: 'text-red-700',
                buttonPrimary: 'bg-red-700 hover:bg-red-800 text-white shadow-lg'
            };
        case 'ocean':
            return {
                text: 'text-blue-600',
                highlight: 'text-blue-900 bg-blue-100 font-bold',
                bg: 'bg-blue-50/50',
                nav: 'bg-blue-200 text-blue-700 hover:bg-blue-300',
                textMain: 'text-blue-950',
                textMuted: 'text-blue-800/70',
                border: 'border-blue-200',
                cardBg: 'bg-white border-blue-200/80 shadow-sm',
                badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
                tipBg: 'bg-yellow-50 text-yellow-800 border-yellow-200',
                accentText: 'text-blue-700',
                buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
            };
        case 'sunset':
            return {
                text: 'text-orange-600',
                highlight: 'text-orange-900 bg-orange-100 font-bold',
                bg: 'bg-orange-50/50',
                nav: 'bg-orange-200 text-orange-700 hover:bg-orange-300',
                textMain: 'text-orange-950',
                textMuted: 'text-orange-800/70',
                border: 'border-orange-200',
                cardBg: 'bg-white border-orange-200/80 shadow-sm',
                badgeBg: 'bg-orange-100 text-orange-800 border-orange-200',
                tipBg: 'bg-yellow-50 text-yellow-800 border-yellow-200',
                accentText: 'text-orange-700',
                buttonPrimary: 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg'
            };
        default:
            return {
                text: 'text-gray-400',
                highlight: 'text-gray-900 bg-yellow-100 font-bold',
                bg: 'bg-white',
                nav: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                textMain: 'text-gray-900',
                textMuted: 'text-gray-500',
                border: 'border-gray-200',
                cardBg: 'bg-gray-50 border-gray-200 shadow-sm',
                badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
                tipBg: 'bg-yellow-50 text-yellow-800 border-yellow-200',
                accentText: 'text-blue-600',
                buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
            };
    }
};
