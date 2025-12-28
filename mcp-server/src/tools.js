const ROBOT_API_URL = process.env.ROBOT_API_URL || 'http://localhost:3000';

// Tool definitions following MCP spec
export const robotTools = {
  list_robots: {
    description: 'List all robots in the fleet inventory. Can filter by status or location.',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Filter by robot status (active, inactive, maintenance, offline)',
          enum: ['active', 'inactive', 'maintenance', 'offline']
        },
        location: {
          type: 'string',
          description: 'Filter by robot location'
        }
      }
    }
  },

  get_robot: {
    description: 'Get details of a specific robot by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The robot ID (e.g., rb-001)'
        }
      },
      required: ['id']
    }
  },

  create_robot: {
    description: 'Create a new robot in the fleet inventory.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name of the robot'
        },
        type: {
          type: 'string',
          description: 'Type of robot (assembly, welding, quality-control, logistics)',
          enum: ['assembly', 'welding', 'quality-control', 'logistics']
        },
        location: {
          type: 'string',
          description: 'Initial location of the robot'
        }
      },
      required: ['name', 'type']
    }
  },

  update_robot: {
    description: 'Update an existing robot in the fleet.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The robot ID to update'
        },
        name: {
          type: 'string',
          description: 'New name for the robot'
        },
        status: {
          type: 'string',
          description: 'New status for the robot',
          enum: ['active', 'inactive', 'maintenance', 'offline']
        },
        location: {
          type: 'string',
          description: 'New location for the robot'
        },
        batteryLevel: {
          type: 'number',
          description: 'New battery level (0-100)',
          minimum: 0,
          maximum: 100
        }
      },
      required: ['id']
    }
  },

  delete_robot: {
    description: 'Delete (decommission) a robot from the fleet.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The robot ID to delete'
        }
      },
      required: ['id']
    }
  },

  schedule_maintenance: {
    description: 'Schedule maintenance for a robot.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The robot ID to schedule maintenance for'
        },
        type: {
          type: 'string',
          description: 'Type of maintenance (routine, repair, upgrade)',
          enum: ['routine', 'repair', 'upgrade']
        },
        scheduledDate: {
          type: 'string',
          description: 'ISO 8601 date for scheduled maintenance'
        }
      },
      required: ['id']
    }
  }
};

// Make API request to the robot API
async function apiRequest(method, path, body = null) {
  const url = `${ROBOT_API_URL}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (response.status === 204) {
    return { success: true };
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `API error: ${response.status}`);
  }

  return data;
}

// Handle tool calls
export async function handleToolCall(toolName, params) {
  try {
    let result;

    switch (toolName) {
      case 'list_robots': {
        const queryParams = new URLSearchParams();
        if (params.status) queryParams.append('status', params.status);
        if (params.location) queryParams.append('location', params.location);
        const query = queryParams.toString();
        const path = query ? `/api/robots?${query}` : '/api/robots';
        result = await apiRequest('GET', path);
        break;
      }

      case 'get_robot': {
        result = await apiRequest('GET', `/api/robots/${params.id}`);
        break;
      }

      case 'create_robot': {
        result = await apiRequest('POST', '/api/robots', {
          name: params.name,
          type: params.type,
          location: params.location
        });
        break;
      }

      case 'update_robot': {
        const { id, ...updates } = params;
        result = await apiRequest('PUT', `/api/robots/${id}`, updates);
        break;
      }

      case 'delete_robot': {
        result = await apiRequest('DELETE', `/api/robots/${params.id}`);
        break;
      }

      case 'schedule_maintenance': {
        const { id, type, scheduledDate } = params;
        result = await apiRequest('POST', `/api/robots/${id}/maintenance`, {
          type,
          scheduledDate
        });
        break;
      }

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
}
