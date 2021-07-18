"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Decoration = void 0;
const vscode_1 = require("vscode");
const Constants_1 = require("./Constants");
class Decoration {
    static decoration() {
        return Decoration.decorationOptions;
    }
    static include() {
        return Decoration.filesToInclude;
    }
    static exclude() {
        return Decoration.filesToExclude;
    }
    static config(config) {
        const textColor = config.get('textColor');
        const stylingType = config.get('stylingType');
        const stylingColor = config.get('stylingColor');
        const stylingBorderRadius = config.get('stylingBorderRadius');
        const rulerLane = config.get('rulerLane');
        const rulerColor = config.get('enableRulerColor');
        const include = config.get('include');
        const exclude = config.get('exclude');
        Decoration.decorationOptions.color = !textColor;
        Decoration.decorationOptions.borderRadius = stylingBorderRadius;
        Decoration.filesToInclude = include || Constants_1.INCLUDE;
        Decoration.filesToExclude = exclude || Constants_1.EXCLUDE;
        if (stylingType === 'background') {
            Decoration.decorationOptions.backgroundColor = stylingColor;
            Decoration.decorationOptions.border = 'none';
        }
        else if (stylingType === 'border') {
            Decoration.decorationOptions.border = `1px solid ${stylingColor} `;
            Decoration.decorationOptions.backgroundColor = 'transparent';
        }
        else {
            Decoration.decorationOptions.border = 'none';
            Decoration.decorationOptions.backgroundColor = 'transparent';
        }
        if (rulerColor) {
            Decoration.decorationOptions.overviewRulerColor = stylingColor;
            Decoration.decorationOptions.overviewRulerLane = vscode_1.OverviewRulerLane[rulerLane];
        }
        else {
            Decoration.decorationOptions.overviewRulerColor = 'transparent';
        }
    }
}
exports.Decoration = Decoration;
Decoration.decorationOptions = {
    rangeBehavior: vscode_1.DecorationRangeBehavior.ClosedClosed
};
;
//# sourceMappingURL=Decoration.js.map