---
name: visual-diagnosis
description: Diagnose and verify interface, document-preview, and browser-rendered changes using concrete defect categories and before/after evidence.
---

# Visual Diagnosis

For submission forms, lists, details, document previews, screenshots, or browser-inspected interfaces:

1. Identify likely root-cause categories: alignment, contrast/readability, scaling/cropping, layout overflow, focus visibility, validation-message placement, wrong component or asset instance, or caching/build issue.
2. Inspect the actual asset path and render path.
3. Identify the specific visual defect.
4. Make the smallest in-scope correction.
5. Verify the before-and-after result using the actual rendered output.
6. Use screenshots, browser inspection, or automated visual checks where appropriate.
7. If the visible result did not materially change, report the task as incomplete and investigate the asset, render, cache, or build path further.
