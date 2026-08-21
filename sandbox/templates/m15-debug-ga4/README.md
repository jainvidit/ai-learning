# Debug GA4 Product Tracking

## The Problem

This product page is supposed to track a `view_item` event to Google Analytics 4 when the page loads. **It's broken.**

## What's Wrong

Open `index.html` in a browser (or check the JavaScript in the `<head>`). You'll see a console error:

```
Uncaught ReferenceError: dataLayer is not defined
```

The code tries to push an event to the `dataLayer` without initializing it first. This is a **very common mistake** in GA4/GTM implementations.

## Your Task

Fix the tracking code so:
1. No JavaScript errors appear in the console
2. The `view_item` event successfully pushes to the data layer
3. The event includes product information (item_id, item_name, price, etc.)

## The Fix

You need to initialize the `dataLayer` array before pushing to it. The standard pattern is:

```javascript
window.dataLayer = window.dataLayer || [];
```

This creates an empty array if `dataLayer` doesn't exist, or keeps the existing array if it does (important for pages with multiple tracking scripts).

## Testing Your Fix

1. Edit `index.html` to add the initialization
2. Open the file in a browser
3. Open the browser console (F12)
4. You should see: "Product view tracking initialized" with no errors
5. Type `dataLayer` in the console to see the pushed event

## Success Criteria

- ✓ No `ReferenceError: dataLayer is not defined` error
- ✓ Console shows "Product view tracking initialized"
- ✓ `dataLayer` array contains the view_item event with product details
