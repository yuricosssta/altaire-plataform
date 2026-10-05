export interface IPilar {
  title: string;
  description: string;
}

export interface ITomDeVoz {
  traits: string[];
  rules: string[];
}

export interface IRentina {
  label: string;
  weight: number;
}

export interface IEditorialMapa {
  _id?: string;
  id?: string;
  versionId: string;
  versionNumber: number;
  name: string;
  positioningPhrase?: string;
  mensagemCentral: string;
  pilares: IPilar[];
  tomDeVoz: ITomDeVoz;
  retina: IRentina[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateEditorialMapa {
  versionId: string;
  versionNumber: number;
  name: string;
  positioningPhrase?: string;
  mensagemCentral: string;
  pilares?: IPilar[];
  tomDeVoz?: ITomDeVoz;
  retina?: IRentina[];
}
