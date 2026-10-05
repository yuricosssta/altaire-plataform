import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EditorialMapaDocument = EditorialMapa & Document;

class TomDeVozSubDoc {
  @Prop({ type: [String], default: [] })
  traits: string[];

  @Prop({ type: [String], default: [] })
  rules: string[];
}

class PilarSubDoc {
  @Prop()
  title: string;

  @Prop()
  description: string;
}

class RetinaSubDoc {
  @Prop()
  label: string;

  @Prop()
  weight: number;
}

@Schema({ timestamps: true })
export class EditorialMapa {
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'EditorialVersion',
    name: 'vid',
  })
  versionId: Types.ObjectId;

  @Prop({ required: true, name: 'vn' })
  versionNumber: number;

  @Prop({ required: true, name: 'n' })
  name: string;

  @Prop({ name: 'pp' })
  positioningPhrase?: string;

  @Prop({ required: true, name: 'mc' })
  mensagemCentral: string;

  @Prop({ type: [PilarSubDoc], default: [], name: 'pl' })
  pilares: Types.Array<PilarSubDoc>;

  @Prop({
    type: TomDeVozSubDoc,
    default: { traits: [], rules: [] },
    name: 'tv',
  })
  tomDeVoz: TomDeVozSubDoc;

  @Prop({ type: [RetinaSubDoc], default: [], name: 'rt' })
  retina: Types.Array<RetinaSubDoc>;
}

export const EditorialMapaSchema = SchemaFactory.createForClass(EditorialMapa);

EditorialMapaSchema.index({ vid: 1 });
