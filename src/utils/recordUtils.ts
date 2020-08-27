export const getRecordsKeyedById = <T extends { id: number }>(records: T[]) => {
  return records.reduce<{ [p: number]: T }>((result, item) => {
    result[item.id] = item;
    return result;
  }, {});
};

export const getNameWithInitials = (fullName: string) => {
  const [surname, name, patronymic] = fullName.split(' ');
  return `${surname} ${name.substring(0, 1)}. ${patronymic.substring(0, 1)}.`;
};
