import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup, PDFOptionList } from 'pdf-lib';

export type FieldType = 'TextField' | 'CheckBox' | 'Dropdown' | 'RadioGroup' | 'OptionList' | 'Unknown';

export interface PdfFieldInfo {
  name: string;
  type: FieldType;
  value: any;
  options?: string[]; // Pour Dropdown, RadioGroup, OptionList
}

export async function extractPdfFields(file: File): Promise<PdfFieldInfo[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  
  const form = pdfDoc.getForm();
  const fields = form.getFields();
  
  const fieldInfos: PdfFieldInfo[] = [];

  for (const field of fields) {
    const name = field.getName();
    let type: FieldType = 'Unknown';
    let value: any = null;
    let options: string[] | undefined;

    const typeName = field.constructor.name;

    if (typeName === 'PDFTextField') {
      type = 'TextField';
      value = (field as PDFTextField).getText() || '';
    } else if (typeName === 'PDFCheckBox') {
      type = 'CheckBox';
      value = (field as PDFCheckBox).isChecked();
    } else if (typeName === 'PDFDropdown') {
      type = 'Dropdown';
      options = (field as PDFDropdown).getOptions();
      value = (field as PDFDropdown).getSelected() || [];
    } else if (typeName === 'PDFRadioGroup') {
      type = 'RadioGroup';
      options = (field as PDFRadioGroup).getOptions();
      value = (field as PDFRadioGroup).getSelected() || '';
    } else if (typeName === 'PDFOptionList') {
      type = 'OptionList';
      options = (field as PDFOptionList).getOptions();
      value = (field as PDFOptionList).getSelected() || [];
    }

    // On ignore les champs non gérés (comme les Signatures)
    if (type !== 'Unknown') {
      fieldInfos.push({ name, type, value, options });
    }
  }

  return fieldInfos;
}

export async function fillPdfFields(
  file: File, 
  fieldValues: Record<string, any>, 
  flatten: boolean = false,
  options?: { onProgress?: (progress: number) => void }
): Promise<Uint8Array> {
  if (options?.onProgress) options.onProgress(10);
  
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  
  if (options?.onProgress) options.onProgress(40);
  
  const form = pdfDoc.getForm();
  
  for (const [name, value] of Object.entries(fieldValues)) {
    try {
      const field = form.getField(name);
      
      const typeName = field.constructor.name;
      
      if (typeName === 'PDFTextField') {
        (field as PDFTextField).setText(value as string);
      } else if (typeName === 'PDFCheckBox') {
        if (value) (field as PDFCheckBox).check();
        else (field as PDFCheckBox).uncheck();
      } else if (typeName === 'PDFDropdown') {
        (field as PDFDropdown).select(value as string | string[]);
      } else if (typeName === 'PDFRadioGroup') {
        (field as PDFRadioGroup).select(value as string);
      } else if (typeName === 'PDFOptionList') {
        (field as PDFOptionList).select(value as string | string[]);
      }
    } catch (err) {
      console.warn(`Impossible de remplir le champ ${name}`, err);
    }
  }
  
  if (options?.onProgress) options.onProgress(70);

  if (flatten) {
    form.flatten();
  }
  
  const pdfBytes = await pdfDoc.save();
  
  if (options?.onProgress) options.onProgress(100);
  
  return pdfBytes;
}
