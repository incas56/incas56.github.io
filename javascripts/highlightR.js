/**
 *  Author: Yihui Xie
 *  URL: http://yihui.name/en/2010/09/syntaxhighlighter-brush-for-the-r-language
 *  License: GPL-2 | GPL-3
 */
dp.sh.Brushes.R = function()
{
    var keywords = 'if else repeat while function for in next break TRUE FALSE NULL Inf NaN NA NA_integer_ NA_real_ NA_complex_ NA_character_';
    var constants = 'LETTERS letters month.abb month.name pi';
    this.regexList = [
    { regex: dp.sh.RegexLib.SingleLinePerlComments, css: 'comments' },
    { regex: dp.sh.RegexLib.SingleQuotedString,     css: 'string' },
    { regex: dp.sh.RegexLib.DoubleQuotedString,     css: 'string' },
    { regex: new RegExp(this.GetKeywords(keywords), 'gm'),      css: 'keyword' },
    { regex: new RegExp(this.GetKeywords(constants), 'gm'),     css: 'constants' },
    { regex: /[\w._]+[ \t]*(?=\()/gm,               css: 'functions' },
    ];
};
dp.sh.Brushes.R.prototype   = new SyntaxHighlighter.Highlighter();
dp.sh.Brushes.R.aliases = ['r', 's', 'splus'];