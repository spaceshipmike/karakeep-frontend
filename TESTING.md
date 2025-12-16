# Testing Guide for Edit & Triage Features

## Manual Testing Checklist

### Single Bookmark Operations

**QuickActions on Cards:**
- [ ] Hover over bookmark card - QuickActions appear in bottom-right
- [ ] Click favorite button - bookmark favorited (red heart icon appears)
- [ ] Click archive button - bookmark archived
- [ ] Click edit button - edit modal opens
- [ ] Click delete button - confirmation dialog appears
- [ ] Confirm delete - bookmark removed from grid

**Edit Modal:**
- [ ] Edit bookmark title - changes saved on "Save Changes"
- [ ] Edit bookmark note - changes saved
- [ ] Press Cmd+Enter - modal closes and saves
- [ ] Press Escape - modal closes without saving
- [ ] Click Cancel - modal closes without saving

**Toast Notifications:**
- [ ] Successful operations show green success toast
- [ ] Failed operations show red error toast
- [ ] Toasts auto-dismiss after 5 seconds
- [ ] Multiple toasts stack properly

**Detail Page:**
- [ ] Navigate to bookmark detail page
- [ ] Floating QuickActions button appears (bottom-right)
- [ ] Click edit - modal opens
- [ ] Edit and save - changes reflected immediately
- [ ] Delete bookmark - redirects to home

### Multi-Select Operations

**Selection Mode:**
- [ ] Click selection mode toggle button
- [ ] Button shows selected count badge
- [ ] Checkboxes appear on all bookmark cards
- [ ] Click card - toggles selection (blue ring appears)
- [ ] Click checkbox - toggles selection
- [ ] Click "Select all" - all visible bookmarks selected
- [ ] Click "Clear selection" - all bookmarks deselected

**Bulk Actions Toolbar:**
- [ ] Select bookmarks - toolbar appears at bottom-center
- [ ] Shows correct selection count
- [ ] Click Favorite - all selected bookmarks favorited
- [ ] Click Archive - all selected bookmarks archived
- [ ] Click Add Tags - tag modal opens
- [ ] Click Add to List - list modal opens
- [ ] Click Delete - confirmation dialog appears

**Bulk Tag Modal:**
- [ ] Enter comma-separated tags
- [ ] Press Enter - tags added to all selected bookmarks
- [ ] Error handling for invalid input
- [ ] Cancel closes modal without changes

**Bulk List Modal:**
- [ ] Lists load dynamically
- [ ] Select a list from picker
- [ ] Confirm - all bookmarks added to list
- [ ] Smart lists are filtered out (can't manually add)

**Bulk Progress Modal:**
- [ ] Shows during bulk operation
- [ ] Progress bar updates in real-time
- [ ] Shows count: "X of Y bookmarks"
- [ ] Displays success/failed counts
- [ ] Shows error messages for failures
- [ ] Auto-closes after completion (or manual close)

### Keyboard Shortcuts

**Navigation:**
- [ ] Press `/` - search input focused
- [ ] Press `Escape` - current element blurred

**Edit Operations (when not in input):**
- [ ] Press `e` - edit modal opens for current bookmark
- [ ] Press `f` - toggle favorite
- [ ] Press `a` - toggle archive
- [ ] Press `x` - toggle selection mode
- [ ] Press `Cmd+A` (in selection mode) - select all bookmarks
- [ ] Press `Delete` - delete current/selected bookmark(s) with confirmation
- [ ] Press `t` - add tags modal opens
- [ ] Press `l` - add to list modal opens

**Help:**
- [ ] Press `?` - keyboard shortcuts logged to console

### Error Handling

**Network Errors:**
- [ ] Disconnect from API - operations show error toasts
- [ ] Optimistic updates rollback on error
- [ ] Original state restored after failed operation

**Validation:**
- [ ] Empty tag input - "Add Tags" button disabled
- [ ] No list selected - "Add to List" button disabled
- [ ] Delete confirmation - cannot be bypassed

### Optimistic UI Updates

**Single Operations:**
- [ ] Favorite toggle - instant visual feedback
- [ ] Archive toggle - instant visual feedback
- [ ] Title edit - instant update in grid
- [ ] If operation fails - state rolls back

**Bulk Operations:**
- [ ] Grid updates as each operation completes
- [ ] Failed bookmarks remain unchanged
- [ ] Success/failure tracked per bookmark

## Automated Testing (Playwright)

To set up Playwright testing:

\`\`\`bash
npm install -D @playwright/test
npx playwright install
\`\`\`

### Test Scenarios

1. **Single Bookmark CRUD:**
   - Edit title and note
   - Toggle favorite and archive
   - Delete bookmark

2. **Multi-Select Flow:**
   - Enter selection mode
   - Select multiple bookmarks
   - Perform bulk operations
   - Verify progress tracking

3. **Keyboard Shortcuts:**
   - Test all keyboard shortcuts
   - Verify they don't trigger in input fields
   - Test modifier combinations

4. **Error Recovery:**
   - Mock API failures
   - Verify optimistic rollback
   - Check error toast display

5. **Accessibility:**
   - Keyboard navigation
   - ARIA labels
   - Focus management

## Build Verification

\`\`\`bash
# TypeScript type checking
npx tsc --noEmit

# Production build
npm run build

# Start production server
npm run start
\`\`\`

All checks should pass with no errors.

## Performance Testing

- [ ] Selection mode with 100+ bookmarks - smooth interaction
- [ ] Bulk operation on 50+ bookmarks - progress tracked correctly
- [ ] Multiple concurrent operations - no UI blocking
- [ ] Toast notification queue - handles rapid operations

## Browser Compatibility

Test in:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari

## Mobile Testing

- [ ] Touch interactions work for selection
- [ ] QuickActions accessible on mobile
- [ ] Modals render properly on small screens
- [ ] Keyboard shortcuts ignored on mobile (no physical keyboard)
