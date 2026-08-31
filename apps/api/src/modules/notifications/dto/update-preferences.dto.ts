// Use a simple class-based DTO to avoid adding an extra zod dependency to the api package.
// The shape mirrors the expected payload:
// { preferences: [{ type: string, viaInApp?: boolean, viaEmail?: boolean, viaPush?: boolean }] }

export class PreferenceItemDto {
  type!: string;
  viaInApp?: boolean;
  viaEmail?: boolean;
  viaPush?: boolean;
}

export class UpdatePreferencesDto {
  preferences!: PreferenceItemDto[];
}
