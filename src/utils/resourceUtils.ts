import { Resource, Specialty, SPECIALTY_LABELS } from '../types/resources';
import { TSelectListItem } from '../components/SelectList/SelectListItem';
import { TSelectListItemGroup } from '../components/SelectList/SelectListItemGroup';

export const mapResourceToSelectItems = (
  resources: Resource[],
  listDisplayMode: 'specialty' | 'alpha'
): Array<TSelectListItem | TSelectListItemGroup> => {
  if (listDisplayMode === 'alpha') {
    return resources.sort(sortByName).map((item) => ({
      value: item.id,
      label: `${item.fullName}, ${item.office} (${item.specialtyLabel})`,
    }));
  } else {
    const specialtyGroups = Object.values(Specialty).map((specialtyItem) => ({
      value: specialtyItem,
      label: SPECIALTY_LABELS[specialtyItem],
      children: [],
    }));

    return resources
      .sort(sortByName)
      .reduce<TSelectListItemGroup[]>((acc, item) => {
        const specialtyItem = acc.find(({ value }) => value === item.specialty);
        if (specialtyItem) {
          specialtyItem.children.push({
            value: item.id,
            label: `${item.fullName}, ${item.office}`,
          });
        }
        return acc;
      }, specialtyGroups);
  }
};

const sortByName = (a: Resource, b: Resource) => {
  return a.fullName.localeCompare(b.fullName);
};
