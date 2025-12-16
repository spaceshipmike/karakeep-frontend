/**
 * MCP Tool Helper for Server-Side Use
 *
 * Note: This is a stub implementation. In a real Next.js environment with MCP integration,
 * you would use the actual MCP client. For now, these functions call the Karakeep API directly
 * since we cannot access MCP tools from server-side routes.
 */

const API_URL = process.env.KARAKEEP_API_URL || "http://localhost:3000";
const API_KEY = process.env.KARAKEEP_API_KEY || "";

/**
 * Call an MCP tool (stub implementation using direct API calls)
 */
export async function call_tool(toolName: string, args: Record<string, any>): Promise<any> {
  // Map MCP tool names to Karakeep API endpoints
  switch (toolName) {
    case "karakeep-karakeep-attach-tag-to-bookmark": {
      const { bookmarkId, tagsToAttach } = args;
      return await attachTags(bookmarkId, tagsToAttach);
    }

    case "karakeep-karakeep-detach-tag-from-bookmark": {
      const { bookmarkId, tagsToDetach } = args;
      return await detachTags(bookmarkId, tagsToDetach);
    }

    case "karakeep-karakeep-add-bookmark-to-list": {
      const { bookmarkId, listId } = args;
      return await addToList(bookmarkId, listId);
    }

    case "karakeep-karakeep-remove-bookmark-from-list": {
      const { bookmarkId, listId } = args;
      return await removeFromList(bookmarkId, listId);
    }

    default:
      throw new Error(`Unknown MCP tool: ${toolName}`);
  }
}

/**
 * Attach tags to a bookmark via Karakeep API
 */
async function attachTags(bookmarkId: string, tags: string[]): Promise<void> {
  for (const tag of tags) {
    const response = await fetch(
      `${API_URL}/api/v1/bookmarks/${bookmarkId}/tags`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({ tagName: tag }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to attach tag "${tag}": ${response.statusText}`);
    }
  }
}

/**
 * Detach tags from a bookmark via Karakeep API
 */
async function detachTags(bookmarkId: string, tags: string[]): Promise<void> {
  // First get the bookmark to find tag IDs
  const bookmarkResponse = await fetch(
    `${API_URL}/api/v1/bookmarks/${bookmarkId}`,
    {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    }
  );

  if (!bookmarkResponse.ok) {
    throw new Error(`Failed to fetch bookmark: ${bookmarkResponse.statusText}`);
  }

  const bookmark = await bookmarkResponse.json();
  const tagMap = new Map(
    bookmark.tags?.map((t: any) => [t.name.toLowerCase(), t.id]) || []
  );

  for (const tagName of tags) {
    const tagId = tagMap.get(tagName.toLowerCase());
    if (!tagId) {
      console.warn(`Tag "${tagName}" not found on bookmark ${bookmarkId}`);
      continue;
    }

    const response = await fetch(
      `${API_URL}/api/v1/bookmarks/${bookmarkId}/tags/${tagId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to detach tag "${tagName}": ${response.statusText}`);
    }
  }
}

/**
 * Add bookmark to a list via Karakeep API
 */
async function addToList(bookmarkId: string, listId: string): Promise<void> {
  const response = await fetch(
    `${API_URL}/api/v1/lists/${listId}/bookmarks`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ bookmarkId }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to add bookmark to list: ${response.statusText}`);
  }
}

/**
 * Remove bookmark from a list via Karakeep API
 */
async function removeFromList(bookmarkId: string, listId: string): Promise<void> {
  const response = await fetch(
    `${API_URL}/api/v1/lists/${listId}/bookmarks/${bookmarkId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to remove bookmark from list: ${response.statusText}`);
  }
}
