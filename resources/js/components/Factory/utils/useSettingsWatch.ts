import { nextTick, toValue, watch, type WatchSource } from "vue";

// A card fills its fields from the saved answer when it opens, which is no
// edit. Call the returned function after that fill: only changes after it save.
// A new answer (`isNew`) saves the fields' defaults once, so the stored options
// match what the card shows.
export const useSettingsWatch = (
    sources: WatchSource[],
    save: (values: any[]) => void,
) => {
    let ready = false;

    watch(sources, (values) => {
        if (ready) save(values);
    });

    return async (isNew = false) => {
        await nextTick();
        ready = true;

        if (isNew) save(sources.map((source) => toValue(source)));
    };
};
