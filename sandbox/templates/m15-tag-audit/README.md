# Tag Audit Exercise

## Goal

Build an automated validator that checks HTML pages for common tracking mistakes.

## The Files

- **page-clean.html** - A product page with correct tracking implementation
- **page-broken.html** - A product page with 3 tracking bugs

## Your Task

Create `validator.js` that:
1. Reads an HTML file from command-line argument
2. Checks for common issues (see below)
3. Exits with code 0 if clean, code 1 if broken
4. Prints clear error messages

## What to Check

**✓ GTM Container Loads**
- Look for `<script>` tag containing `googletagmanager.com/gtm.js?id=GTM-`
- Missing GTM = instant fail

**✓ Data Layer Initialization**
- Look for `dataLayer = dataLayer || []` or `window.dataLayer = window.dataLayer || []`
- Should appear BEFORE any `dataLayer.push()` calls

**✓ No Push Before Init**
- If `dataLayer.push(` appears before initialization, that's a bug
- Check the order in the HTML

**✓ Event Names Exist** (Optional bonus)
- dataLayer.push() should include `event: 'something'`
- If event property is missing, tracking won't work

## How to Run

```bash
# Should pass (exit 0)
node validator.js page-clean.html

# Should fail (exit 1) and print errors
node validator.js page-broken.html
```

## Example Output (Broken Page)

```
Checking: page-broken.html
❌ GTM container not found
❌ dataLayer.push() called before initialization
❌ dataLayer.push() missing event name (line ~33)

Validation FAILED
```

## Example Output (Clean Page)

```
Checking: page-clean.html
✓ GTM container found
✓ dataLayer properly initialized
✓ All pushes have event names

Validation PASSED
```

## Hints

- Use `fs.readFileSync()` to read the HTML file
- Simple string methods (indexOf, includes) work fine for these checks
- `process.exit(0)` for success, `process.exit(1)` for failure
- Test on BOTH files to verify your validator works correctly

## What's Broken in page-broken.html?

1. GTM script is completely missing
2. dataLayer.push() happens BEFORE `dataLayer = []`
3. One push is missing the 'event' property

Your validator should catch all three issues!
