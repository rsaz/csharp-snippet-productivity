import { DecorationRangeBehavior, DecorationRenderOptions, OverviewRulerLane, WorkspaceConfiguration } from "vscode";
import { EXCLUDE, INCLUDE } from "./Constants";

export class Decoration {
    private static filesToInclude: string[];
    private static filesToExclude: string[];
    private static decorationOptions: DecorationRenderOptions = {
      rangeBehavior: DecorationRangeBehavior.ClosedClosed
    };
  
    public static decoration(): DecorationRenderOptions {
      return Decoration.decorationOptions;
    }
  
    public static include(): string[] {
      return Decoration.filesToInclude;
    }
  
    public static exclude(): string[] {
      return Decoration.filesToExclude;
    }
  
    public static config(config: WorkspaceConfiguration): void {
      const textColor = config.get<string>('textColor');
      const stylingType = config.get<string>('stylingType');
      const stylingColor = config.get<string>('stylingColor');
      const stylingBorderRadius = config.get<string>('stylingBorderRadius');
      const rulerLane = config.get<'Left' | 'Right' | 'Center' | 'Full'>('rulerLane');
      const rulerColor = config.get<boolean>('enableRulerColor');
      const include = config.get<string[]>('include');
      const exclude = config.get<string[]>('exclude');
  
      Decoration.decorationOptions.color = !textColor;
      Decoration.decorationOptions.borderRadius = stylingBorderRadius as string;
      Decoration.filesToInclude = include || INCLUDE;
      Decoration.filesToExclude = exclude || EXCLUDE;
  
      if (stylingType === 'background') {
        Decoration.decorationOptions.backgroundColor = stylingColor as string;
        Decoration.decorationOptions.border = 'none';
      } else if (stylingType === 'border') {
        Decoration.decorationOptions.border = `1px solid ${stylingColor} `;
        Decoration.decorationOptions.backgroundColor = 'transparent';
      } else {
        Decoration.decorationOptions.border = 'none';
        Decoration.decorationOptions.backgroundColor = 'transparent';
      }
  
      if (rulerColor) {
        Decoration.decorationOptions.overviewRulerColor = stylingColor as string;
        Decoration.decorationOptions.overviewRulerLane = OverviewRulerLane[rulerLane!];
      } else {
        Decoration.decorationOptions.overviewRulerColor = 'transparent';
      }
    }
  };