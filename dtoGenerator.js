function generateDTOFromPrismaSchema(prismaSchema) {
  const modelRegex = /model\s+(\w+)\s+\{([^}]+)\}/g;

  const fieldTypeMessages = {
    String: fieldName => `${fieldName} must be a string value`,
    Int: fieldName => `${fieldName} must be an integer value`,
    Float: fieldName => `${fieldName} must be a floating point number`,
    Boolean: fieldName => `${fieldName} must be a boolean value`,
    DateTime: fieldName => `${fieldName} must be a valid date and time`,
    Json: fieldName => `${fieldName} must be a valid JSON object`,
    UUID: fieldName => `${fieldName} must be a valid UUID`,
    Email: fieldName => `${fieldName} must be a valid email address`,
    Url: fieldName => `${fieldName} must be a valid URL`,
  };

  let dtoClasses = '';

  let match;
  while ((match = modelRegex.exec(prismaSchema)) !== null) {
    const modelName = match[1];
    const fields = match[2].trim().split('\n');

    let dtoClass = `export class ${modelName}DTO {\n`;

    fields.forEach(field => {
      const [fieldName, fieldType] = field.trim().split(/\s+/);

      const isOptional = field.endsWith('?');
      const cleanFieldName = fieldName.replace(/[!?]$/, '');
      const cleanfieldType = fieldType.replace(/[!?]$/, '');
      const message = fieldTypeMessages[fieldType] ? fieldTypeMessages[fieldType](cleanFieldName) : `${cleanFieldName} must be of type ${cleanfieldType}`;

      dtoClass += `  @Is${cleanfieldType}({ message: '${message}' })\n`;

      if (isOptional) {
        dtoClass += `  @IsOptional()\n`;
      } else {
        dtoClass += `  @IsNotEmpty({message: '${cleanFieldName} should not be empty' })}\n`;
      }

      // Add minLength and maxLength decorators based on Prisma schema
      if (field.includes('@minLength')) {
        const minLength = field.match(/@minLength\((\d+)\)/)[1];
        dtoClass += `  @MinLength(${minLength}, { message: '${cleanFieldName} must be at least ${minLength} characters long' })\n`;
      }

      if (field.includes('@maxLength')) {
        const maxLength = field.match(/@maxLength\((\d+)\)/)[1];
        dtoClass += `  @MaxLength(${maxLength}, { message: '${cleanFieldName} must not exceed ${maxLength} characters' })\n`;
      }

      dtoClass += `  ${fieldName}: ${fieldType};\n\n`;
    });

    dtoClass += '}\n\n';

    dtoClasses += dtoClass;
  }

  return dtoClasses;
}

module.exports = { generateDTOFromPrismaSchema };