export const useInteractionsUtils = () => {
    const findOrCreate = async (
        type,
        store
    ): Promise<FormBlockInteractionModel> => {
        const foundExisting = store.block.interactions.findIndex((item) => {
            return item.type === type;
        });

        if (foundExisting === -1) {
            const response = await store.createInteraction(type);

            if (response) {
                return response;
            }
        }

        return Promise.resolve(store.block.interactions[foundExisting]);
    };

    return {
        findOrCreate,
    };
};
