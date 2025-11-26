<template>
    <div class="example-extension">
        <div class="extension-header">
            <h4>Example Extension</h4>
            <p class="text-muted small">This is a bare-bones checkout extension example (JavaScript)</p>
        </div>

        <!-- Example: Display cart information -->
        <div v-if="cart" class="cart-info">
            <p><strong>Cart Items:</strong> {{ itemCount }}</p>
            <p v-if="cart.cart_items && cart.cart_items.length > 0" class="small">
                Total items in cart: {{ cart.cart_items.length }}
            </p>
        </div>

        <!-- Example: Display messages -->
        <div v-if="message" class="alert alert-info">{{ message }}</div>
        <div v-if="error" class="alert alert-danger">{{ error }}</div>

        <!-- Example: Loading state -->
        <div v-if="loading" class="text-muted small mt-2">Processing...</div>
    </div>
</template>

<script setup>
    import { onMounted, ref, onUnmounted, computed, inject, toRefs } from 'vue';

    // Inject checkoutApi from parent component (provided via provide/inject)
    const injectedApi = inject('checkoutApi');
    if (!injectedApi) {
        throw new Error('checkoutApi injection missing');
    }
    const checkoutApi = injectedApi;

    // Use shared state (provided by checkoutApi)
    // This state persists across component re-renders
    const sharedState = checkoutApi.useState(() => ({
        message: null,
        error: null,
        loading: false,
    }));

    const { message, error, loading } = toRefs(sharedState);

    // Local reactive state
    const cart = ref(null);

    // Teardown functions for hooks
    const beforeCompleteTeardown = ref(null);
    const cartChangeTeardown = ref(null);

    // Computed property: count cart items
    const itemCount = computed(() => {
        return cart.value?.cart_items?.length || 0;
    });

    /**
     * Sync cart data
     * Called when the cart changes
     */
    function syncCart() {
        try {
            cart.value = checkoutApi.getCart();
            checkoutApi.setState({
                message: `Cart updated: ${itemCount.value} item(s)`,
            });
        } catch (err) {
            console.error('Error syncing cart:', err);
            checkoutApi.setState({
                error: 'Failed to load cart data',
            });
        }
    }

    /**
     * Hook: beforeCompleteOrder
     * Called before the order is completed
     * Return false to prevent order completion
     */
    async function beforeCompleteOrder() {
        try {
            // Example: Show loading state
            checkoutApi.setState({ loading: true, message: 'Validating order...' });

            // Example: Make an API call to validate something
            // Uncomment to test:
            // const response = await checkoutApi.request('POST', '/api/validate', {
            //     cart: cart.value,
            // });

            // Simulate async operation
            await new Promise(resolve => setTimeout(resolve, 500));

            // Example: Clear loading state
            checkoutApi.setState({ loading: false, message: null });

            // Return true to allow order completion
            // Return false to prevent order completion
            return true;
        } catch (err) {
            console.error('Validation error:', err);
            checkoutApi.setState({
                error: 'Validation failed. Please try again.',
                loading: false,
            });
            return false; // Prevent order completion on error
        }
    }

    /**
     * Hook: onCartChange
     * Called whenever the cart changes
     */
    function handleCartChange(newCart) {
        cart.value = newCart;
        syncCart();
    }

    // Lifecycle: Mount
    onMounted(() => {
        // Initialize cart
        syncCart();

        // Register hooks
        // These hooks allow you to react to checkout events
        beforeCompleteTeardown.value = checkoutApi.registerHook(
            'beforeCompleteOrder',
            beforeCompleteOrder
        );

        cartChangeTeardown.value = checkoutApi.registerHook(
            'onCartChange',
            handleCartChange
        );
    });

    // Lifecycle: Unmount
    // Clean up hooks when component is destroyed
    onUnmounted(() => {
        beforeCompleteTeardown.value?.();
        cartChangeTeardown.value?.();
    });
</script>

<style scoped>
    .example-extension {
        padding: 1rem;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        margin: 1rem 0;
    }

    .extension-header {
        margin-bottom: 1rem;
    }

    .extension-header h4 {
        margin: 0 0 0.5rem 0;
    }

    .cart-info {
        padding: 0.75rem;
        background-color: #f5f5f5;
        border-radius: 4px;
        margin: 0.5rem 0;
    }

    .alert {
        padding: 0.75rem;
        border-radius: 4px;
        margin: 0.5rem 0;
    }

    .alert-info {
        background-color: #d1ecf1;
        border: 1px solid #bee5eb;
        color: #0c5460;
    }

    .alert-danger {
        background-color: #f8d7da;
        border: 1px solid #f5c6cb;
        color: #721c24;
    }

    .text-muted {
        color: #6c757d;
    }

    .small {
        font-size: 0.875rem;
    }

    .mt-2 {
        margin-top: 0.5rem;
    }
</style>

