/**
 * Main API client with all categories
 * Centralized access point for all API requests
 */
import * as catalog from "@/services/requests/catalog"
import * as lists from "@/services/requests/lists"
import * as locations from "@/services/requests/locations"
import * as settings from "@/services/requests/settings"
import * as templates from "@/services/requests/templates"
import * as user from "@/services/requests/user"

export const ApiClient = {
  /**
   * User-related API methods
   */
  user,

  /**
   * Lists-related API methods
   */
  lists,

  /**
   * Catalog-related API methods
   */
  catalog,

  /**
   * Settings-related API methods
   */
  settings,

  /**
   * Locations-related API methods
   */
  locations,

  /**
   * Templates-related API methods
   */
  templates,

  /**
   * Notifications-related API methods
   */
  notifications: {}
}

/**
 * Default export
 */
export default ApiClient
