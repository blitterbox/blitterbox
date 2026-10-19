export interface ColorTokens {
  vellum: string;
  graphite: string;
  chartreuse: string;
  cream: string;
  paper: string;
  pencil: string;
  shade: string;
}

export interface FaceSet {
  top: string;
  front: string;
  side: string;
}

export interface FaceTokens {
  brand: FaceSet;
  neutral: FaceSet;
}

export interface IsoStroke {
  width: number;
  color: string;
  join: string;
}

export interface IsoTokens {
  angle: number;
  module: number;
  stroke: IsoStroke;
}

export interface MotionDrop {
  duration: string;
  easing: [number, number, number, number];
  distance: number;
  stagger: string;
}

export interface MotionCallout {
  mode: string;
  perChar: string;
  delay: string;
}

export interface MotionLogo {
  base: string;
  sides: string;
  locked: string;
  name: string;
}

export interface MotionTokens {
  drop: MotionDrop;
  callout: MotionCallout;
  logo: MotionLogo;
  forbidden: string[];
}

export interface TypographyStyle {
  fontFamily: string[];
  fontWeight: number;
  fontSize: string;
  lineHeight: number;
  letterSpacing: string;
}

export interface TypographyTokens {
  display: TypographyStyle;
  h1: TypographyStyle;
  h2: TypographyStyle;
  body: TypographyStyle;
  label: TypographyStyle;
  code: TypographyStyle;
  wordmark: TypographyStyle;
}
