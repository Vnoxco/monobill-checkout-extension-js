import App from './App.vue';

// Get Vue runtime from global scope (provided by the checkout system)
const vueRuntime = globalThis.Vue;
const defineComponent = (vueRuntime && vueRuntime.defineComponent) || 
    ((options) => options);

/**
 * Example Checkout Extension (JavaScript Version)
 * 
 * This is a bare-bones example of a checkout extension.
 * It demonstrates the basic structure and API usage without any domain-specific logic.
 */
export default {
    // Mount point: where this extension will be rendered in the checkout
    // Options: 'summary', 'payment', 'shipping', etc.
    mountPoint: 'summary',

    /**
     * Register the extension
     * This function is called by the checkout system to initialize your extension
     * 
     * @param {Object} context - The registration context containing checkoutApi
     * @param {Object} context.checkoutApi - The checkout API instance
     * @returns {Object} A Vue component definition
     */
    registerExtension({ checkoutApi }) {
        return defineComponent({
            components: { App },
            template: '<App />',
            provide() {
                return {
                    checkoutApi,
                };
            },
        });
    },
};

