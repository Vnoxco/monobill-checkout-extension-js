# Example Checkout Extension (JavaScript Version)

A bare-bones example of a checkout extension for the booking system, written in plain JavaScript (no TypeScript). This extension demonstrates the basic structure and API usage without any domain-specific logic.

## Overview

This extension serves as a template for creating new checkout extensions using plain JavaScript. It shows:

- How to structure a checkout extension
- How to use the CheckoutApi
- How to register and use hooks
- How to use shared state
- How to build and deploy the extension

## Structure

```
example-extension-js/
├── src/
│   ├── App.vue              # Main Vue component
│   └── index.js             # Extension entry point (JavaScript)
├── package.json             # Dependencies and scripts
├── vite.config.mjs          # Vite build configuration
└── README.md                # This file
```

## Getting Started

### 1. Install Dependencies

```bash
cd extensions/checkout/example-extension-js
npm install
```

### 2. Build the Extension

```bash
npm run build
```

This will:
- Compile JavaScript and Vue files
- Bundle the extension into `dist/[ExtensionName].js` (name derived from `package.json`)
- Copy the JS output to `../[ExtensionName].js`

**Note:** The output filename is automatically generated from the `name` field in `package.json`. The kebab-case name (e.g., `example-checkout-extension-js`) is converted to PascalCase (e.g., `ExampleCheckoutExtensionJs.js`).

### 3. Development Mode

Watch for changes and rebuild automatically:

```bash
npm run dev
```

## Extension API

### Entry Point (`src/index.js`)

The entry point exports a default object with:

- **`mountPoint`**: Where the extension will be rendered (`'summary'`, `'payment'`, `'shipping'`, etc.)
- **`registerExtension`**: Function that receives the checkout context and returns a Vue component

```javascript
export default {
    mountPoint: 'summary',
    registerExtension({ checkoutApi }) {
        return defineComponent({
            components: { App },
            template: '<App />',
            provide() {
                return { checkoutApi };
            },
        });
    },
};
```

### CheckoutApi

The `checkoutApi` provides the following methods:

#### `getCart(): CheckoutCart`

Get the current cart data.

```javascript
const cart = checkoutApi.getCart();
console.log(cart.cart_items);
```

#### `registerHook(hook, handler): () => void`

Register a hook handler. Returns a teardown function.

**Available Hooks:**
- `'beforeCompleteOrder'`: Called before order completion. Return `false` to prevent completion.
- `'afterCompleteOrder'`: Called after order completion.
- `'onCartChange'`: Called whenever the cart changes.

```javascript
const teardown = checkoutApi.registerHook('beforeCompleteOrder', async () => {
    // Validate something
    return true; // Allow order completion
});

// Later, clean up:
teardown();
```

#### `request(method, url, payload?): Promise`

Make an API request.

```javascript
const response = await checkoutApi.request(
    'POST',
    '/api/endpoint',
    { data: 'value' }
);
```

#### `useState(initialState?): Object`

Get or initialize shared state. This state persists across component re-renders.

```javascript
const state = checkoutApi.useState(() => ({
    message: null,
    error: null,
    loading: false,
}));

// Access state
console.log(state.message);

// State is reactive and can be used with toRefs
const { message, error } = toRefs(state);
```

#### `setState(partialState): Object`

Update shared state.

```javascript
checkoutApi.setState({
    message: 'Order validated',
    loading: false,
});
```

## Component Structure

### App.vue

The main Vue component receives `checkoutApi` via dependency injection:

```vue
<script setup>
import { inject } from 'vue';

const checkoutApi = inject('checkoutApi');
if (!checkoutApi) {
    throw new Error('checkoutApi injection missing');
}
</script>
```

### Lifecycle Management

Register hooks in `onMounted` and clean them up in `onUnmounted`:

```javascript
onMounted(() => {
    const teardown = checkoutApi.registerHook('onCartChange', handleCartChange);
    // Store teardown for cleanup
});

onUnmounted(() => {
    teardown?.(); // Clean up
});
```

## Customization

### 1. Change the Mount Point

Edit `src/index.js`:

```javascript
export default {
    mountPoint: 'payment', // or 'shipping', etc.
    // ...
};
```

### 2. Add Your Logic

Modify `src/App.vue` to add your custom functionality:

- Add reactive state (local or shared)
- Register hooks for events
- Make API calls
- Display custom UI

## Building for Production

```bash
npm run build
```

The output file will be:
- `dist/[ExtensionName].js` (in the extension directory, name from `package.json`)
- `../[ExtensionName].js` (copied to parent directory)

**Output Filename:** The output filename is automatically derived from the `name` field in `package.json`. For example, if your package name is `my-custom-extension`, the output will be `MyCustomExtension.js`.

## JavaScript vs TypeScript

This is the JavaScript version of the example extension. If you prefer TypeScript with type safety, see the `example-extension` directory.

**Benefits of JavaScript version:**
- No TypeScript compilation step
- Simpler setup (no tsconfig.json needed)
- Faster for simple extensions
- Easier for developers not familiar with TypeScript

**Benefits of TypeScript version:**
- Type safety and autocomplete
- Better IDE support
- Catch errors at compile time
- Self-documenting code with types

## Best Practices

1. **Always clean up hooks**: Store teardown functions and call them in `onUnmounted`
2. **Handle errors**: Wrap API calls in try-catch blocks
3. **Use shared state**: Use `useState` for state that needs to persist across re-renders
4. **Keep it simple**: Extensions should be focused and lightweight
5. **Test thoroughly**: Test your extension in the checkout flow
6. **Add JSDoc comments**: Document your functions for better IDE support

## Example Use Cases

- **Validation**: Validate cart items before order completion
- **Custom Fields**: Add custom input fields to checkout
- **Notifications**: Display custom messages or warnings
- **Integrations**: Integrate with third-party services
- **Analytics**: Track checkout events
- **Discounts**: Apply custom discounts or promotions

## Troubleshooting

### Build Errors

- Ensure all dependencies are installed: `npm install`
- Verify Vite configuration
- Check that `src/index.js` exists (not `.ts`)

### Runtime Errors

- Check browser console for errors
- Verify Vue runtime is available globally
- Ensure hooks are properly registered and cleaned up
- Verify `checkoutApi` is properly injected

## Next Steps

1. Copy this extension to create your own
2. Rename files and update references
3. Add your custom logic
4. Update the mount point if needed
5. Build and test

## License

MIT

