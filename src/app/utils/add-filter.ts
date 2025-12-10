const addFilter = <T extends Record<string, any>>(
  conditions: T[],
  field: keyof T,
  operator: string,
  value: any
) => {
  if (value !== undefined && value !== null && !Number.isNaN(value)) {
    conditions.push({
      [field]: {
        [operator]: value,
      },
    } as T);
  }
};

export default addFilter;
