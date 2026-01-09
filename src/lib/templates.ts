// Pre-built model templates for common use cases
import { DataModel, Entity, Relationship, generateId, calculateEntityHeight, DEFAULT_ENTITY_WIDTH } from '@/types/model';

export interface ModelTemplate {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'technical' | 'content' | 'social';
  icon: string;
  entityCount: number;
  preview: string[];
}

export const MODEL_TEMPLATES: ModelTemplate[] = [
  {
    id: 'ecommerce',
    name: 'E-Commerce',
    description: 'Online store with products, orders, customers, and payments',
    category: 'business',
    icon: '🛒',
    entityCount: 8,
    preview: ['Customer', 'Product', 'Order', 'OrderItem', 'Category', 'Payment', 'Review', 'Address'],
  },
  {
    id: 'hr',
    name: 'HR Management',
    description: 'Employee management, departments, positions, and payroll',
    category: 'business',
    icon: '👥',
    entityCount: 7,
    preview: ['Employee', 'Department', 'Position', 'Salary', 'LeaveRequest', 'Performance', 'Training'],
  },
  {
    id: 'crm',
    name: 'CRM',
    description: 'Customer relationships, leads, opportunities, and activities',
    category: 'business',
    icon: '🤝',
    entityCount: 7,
    preview: ['Contact', 'Company', 'Lead', 'Opportunity', 'Activity', 'Deal', 'Campaign'],
  },
  {
    id: 'blog',
    name: 'Blog Platform',
    description: 'Articles, authors, categories, comments, and tags',
    category: 'content',
    icon: '📝',
    entityCount: 6,
    preview: ['Post', 'Author', 'Category', 'Comment', 'Tag', 'PostTag'],
  },
  {
    id: 'inventory',
    name: 'Inventory Management',
    description: 'Products, warehouses, stock levels, and suppliers',
    category: 'business',
    icon: '📦',
    entityCount: 7,
    preview: ['Product', 'Warehouse', 'StockLevel', 'Supplier', 'PurchaseOrder', 'StockMovement', 'Location'],
  },
  {
    id: 'social',
    name: 'Social Network',
    description: 'Users, posts, comments, likes, and friendships',
    category: 'social',
    icon: '👋',
    entityCount: 7,
    preview: ['User', 'Post', 'Comment', 'Like', 'Friendship', 'Message', 'Notification'],
  },
  {
    id: 'school',
    name: 'School Management',
    description: 'Students, courses, teachers, enrollments, and grades',
    category: 'business',
    icon: '🎓',
    entityCount: 7,
    preview: ['Student', 'Course', 'Teacher', 'Enrollment', 'Grade', 'Class', 'Schedule'],
  },
  {
    id: 'hospital',
    name: 'Healthcare',
    description: 'Patients, doctors, appointments, and medical records',
    category: 'business',
    icon: '🏥',
    entityCount: 8,
    preview: ['Patient', 'Doctor', 'Appointment', 'MedicalRecord', 'Prescription', 'Department', 'Room', 'Bill'],
  },
];

// Helper to create entity with proper dimensions
function createEntity(
  name: string,
  description: string,
  attributes: Array<{
    name: string;
    type: string;
    isPrimaryKey?: boolean;
    isForeignKey?: boolean;
    isRequired?: boolean;
    isUnique?: boolean;
  }>,
  x: number,
  y: number,
  category: Entity['category'] = 'standard'
): Entity {
  const attrs = attributes.map((a) => ({
    id: generateId(),
    name: a.name,
    type: a.type,
    isPrimaryKey: a.isPrimaryKey || false,
    isForeignKey: a.isForeignKey || false,
    isRequired: a.isRequired ?? true,
    isUnique: a.isUnique || false,
    isIndexed: a.isPrimaryKey || a.isForeignKey || false,
  }));

  return {
    id: generateId(),
    name,
    physicalName: name.toLowerCase().replace(/\s+/g, '_'),
    description,
    category,
    x,
    y,
    width: DEFAULT_ENTITY_WIDTH,
    height: calculateEntityHeight(attrs.length),
    attributes: attrs,
  };
}

// Generate full model from template
export function generateModelFromTemplate(templateId: string): DataModel | null {
  const template = MODEL_TEMPLATES.find((t) => t.id === templateId);
  if (!template) return null;

  const entities: Entity[] = [];
  const relationships: Relationship[] = [];

  switch (templateId) {
    case 'ecommerce':
      return generateEcommerceModel();
    case 'hr':
      return generateHRModel();
    case 'crm':
      return generateCRMModel();
    case 'blog':
      return generateBlogModel();
    case 'inventory':
      return generateInventoryModel();
    case 'social':
      return generateSocialModel();
    case 'school':
      return generateSchoolModel();
    case 'hospital':
      return generateHospitalModel();
    default:
      return null;
  }
}

function generateEcommerceModel(): DataModel {
  const customer = createEntity('Customer', 'Store customers', [
    { name: 'id', type: 'UUID', isPrimaryKey: true },
    { name: 'email', type: 'VARCHAR(255)', isUnique: true },
    { name: 'first_name', type: 'VARCHAR(100)' },
    { name: 'last_name', type: 'VARCHAR(100)' },
    { name: 'phone', type: 'VARCHAR(20)', isRequired: false },
    { name: 'created_at', type: 'TIMESTAMP' },
  ], 50, 50);

  const category = createEntity('Category', 'Product categories', [
    { name: 'id', type: 'UUID', isPrimaryKey: true },
    { name: 'name', type: 'VARCHAR(100)' },
    { name: 'slug', type: 'VARCHAR(100)', isUnique: true },
    { name: 'parent_id', type: 'UUID', isForeignKey: true, isRequired: false },
  ], 350, 50, 'lookup');

  const product = createEntity('Product', 'Products for sale', [
    { name: 'id', type: 'UUID', isPrimaryKey: true },
    { name: 'name', type: 'VARCHAR(255)' },
    { name: 'description', type: 'TEXT', isRequired: false },
    { name: 'price', type: 'DECIMAL(10,2)' },
    { name: 'sku', type: 'VARCHAR(50)', isUnique: true },
    { name: 'category_id', type: 'UUID', isForeignKey: true },
    { name: 'stock_quantity', type: 'INTEGER' },
    { name: 'is_active', type: 'BOOLEAN' },
  ], 350, 250);

  const order = createEntity('Order', 'Customer orders', [
    { name: 'id', type: 'UUID', isPrimaryKey: true },
    { name: 'customer_id', type: 'UUID', isForeignKey: true },
    { name: 'status', type: 'VARCHAR(20)' },
    { name: 'total_amount', type: 'DECIMAL(10,2)' },
    { name: 'shipping_address_id', type: 'UUID', isForeignKey: true },
    { name: 'created_at', type: 'TIMESTAMP' },
  ], 50, 300);

  const orderItem = createEntity('OrderItem', 'Items in an order', [
    { name: 'id', type: 'UUID', isPrimaryKey: true },
    { name: 'order_id', type: 'UUID', isForeignKey: true },
    { name: 'product_id', type: 'UUID', isForeignKey: true },
    { name: 'quantity', type: 'INTEGER' },
    { name: 'unit_price', type: 'DECIMAL(10,2)' },
  ], 200, 500, 'junction');

  const payment = createEntity('Payment', 'Order payments', [
    { name: 'id', type: 'UUID', isPrimaryKey: true },
    { name: 'order_id', type: 'UUID', isForeignKey: true },
    { name: 'amount', type: 'DECIMAL(10,2)' },
    { name: 'method', type: 'VARCHAR(50)' },
    { name: 'status', type: 'VARCHAR(20)' },
    { name: 'paid_at', type: 'TIMESTAMP', isRequired: false },
  ], 50, 550);

  const address = createEntity('Address', 'Customer addresses', [
    { name: 'id', type: 'UUID', isPrimaryKey: true },
    { name: 'customer_id', type: 'UUID', isForeignKey: true },
    { name: 'street', type: 'VARCHAR(255)' },
    { name: 'city', type: 'VARCHAR(100)' },
    { name: 'state', type: 'VARCHAR(100)' },
    { name: 'postal_code', type: 'VARCHAR(20)' },
    { name: 'country', type: 'VARCHAR(100)' },
    { name: 'is_default', type: 'BOOLEAN' },
  ], 350, 550);

  const review = createEntity('Review', 'Product reviews', [
    { name: 'id', type: 'UUID', isPrimaryKey: true },
    { name: 'product_id', type: 'UUID', isForeignKey: true },
    { name: 'customer_id', type: 'UUID', isForeignKey: true },
    { name: 'rating', type: 'INTEGER' },
    { name: 'comment', type: 'TEXT', isRequired: false },
    { name: 'created_at', type: 'TIMESTAMP' },
  ], 600, 300);

  const entities = [customer, category, product, order, orderItem, payment, address, review];

  const relationships: Relationship[] = [
    { id: generateId(), name: 'has', type: 'non-identifying', sourceEntityId: customer.id, targetEntityId: order.id, sourceCardinality: '1', targetCardinality: 'M' },
    { id: generateId(), name: 'contains', type: 'identifying', sourceEntityId: order.id, targetEntityId: orderItem.id, sourceCardinality: '1', targetCardinality: 'M' },
    { id: generateId(), name: 'includes', type: 'non-identifying', sourceEntityId: product.id, targetEntityId: orderItem.id, sourceCardinality: '1', targetCardinality: 'M' },
    { id: generateId(), name: 'belongs to', type: 'non-identifying', sourceEntityId: product.id, targetEntityId: category.id, sourceCardinality: 'M', targetCardinality: '1' },
    { id: generateId(), name: 'has', type: 'non-identifying', sourceEntityId: order.id, targetEntityId: payment.id, sourceCardinality: '1', targetCardinality: 'M' },
    { id: generateId(), name: 'has', type: 'non-identifying', sourceEntityId: customer.id, targetEntityId: address.id, sourceCardinality: '1', targetCardinality: 'M' },
    { id: generateId(), name: 'has', type: 'non-identifying', sourceEntityId: product.id, targetEntityId: review.id, sourceCardinality: '1', targetCardinality: 'M' },
    { id: generateId(), name: 'writes', type: 'non-identifying', sourceEntityId: customer.id, targetEntityId: review.id, sourceCardinality: '1', targetCardinality: 'M' },
  ];

  return {
    id: generateId(),
    name: 'E-Commerce Model',
    description: 'Complete e-commerce data model with products, orders, and customers',
    targetDatabase: 'postgresql',
    notation: 'crowsfoot',
    entities,
    relationships,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function generateHRModel(): DataModel {
  const department = createEntity('Department', 'Company departments', [
    { name: 'id', type: 'UUID', isPrimaryKey: true },
    { name: 'name', type: 'VARCHAR(100)' },
    { name: 'code', type: 'VARCHAR(10)', isUnique: true },
    { name: 'manager_id', type: 'UUID', isForeignKey: true, isRequired: false },
  ], 50, 50, 'lookup');

  const position = createEntity('Position', 'Job positions', [
    { name: 'id', type: 'UUID', isPrimaryKey: true },
    { name: 'title', type: 'VARCHAR(100)' },
    { name: 'department_id', type: 'UUID', isForeignKey: true },
    { name: 'min_salary', type: 'DECIMAL(10,2)' },
    { name: 'max_salary', type: 'DECIMAL(10,2)' },
  ], 350, 50, 'lookup');

  const employee = createEntity('Employee', 'Company employees', [
    { name: 'id', type: 'UUID', isPrimaryKey: true },
    { name: 'employee_number', type: 'VARCHAR(20)', isUnique: true },
    { name: 'first_name', type: 'VARCHAR(100)' },
    { name: 'last_name', type: 'VARCHAR(100)' },
    { name: 'email', type: 'VARCHAR(255)', isUnique: true },
    { name: 'phone', type: 'VARCHAR(20)', isRequired: false },
    { name: 'hire_date', type: 'DATE' },
    { name: 'position_id', type: 'UUID', isForeignKey: true },
    { name: 'manager_id', type: 'UUID', isForeignKey: true, isRequired: false },
    { name: 'status', type: 'VARCHAR(20)' },
  ], 200, 250);

  const salary = createEntity('Salary', 'Employee salaries', [
    { name: 'id', type: 'UUID', isPrimaryKey: true },
    { name: 'employee_id', type: 'UUID', isForeignKey: true },
    { name: 'amount', type: 'DECIMAL(10,2)' },
    { name: 'effective_date', type: 'DATE' },
    { name: 'end_date', type: 'DATE', isRequired: false },
  ], 50, 450);

  const leaveRequest = createEntity('LeaveRequest', 'Employee leave requests', [
    { name: 'id', type: 'UUID', isPrimaryKey: true },
    { name: 'employee_id', type: 'UUID', isForeignKey: true },
    { name: 'leave_type', type: 'VARCHAR(50)' },
    { name: 'start_date', type: 'DATE' },
    { name: 'end_date', type: 'DATE' },
    { name: 'status', type: 'VARCHAR(20)' },
    { name: 'approved_by', type: 'UUID', isForeignKey: true, isRequired: false },
  ], 450, 250);

  const performance = createEntity('Performance', 'Performance reviews', [
    { name: 'id', type: 'UUID', isPrimaryKey: true },
    { name: 'employee_id', type: 'UUID', isForeignKey: true },
    { name: 'reviewer_id', type: 'UUID', isForeignKey: true },
    { name: 'review_date', type: 'DATE' },
    { name: 'rating', type: 'INTEGER' },
    { name: 'comments', type: 'TEXT', isRequired: false },
  ], 450, 450);

  const training = createEntity('Training', 'Training programs', [
    { name: 'id', type: 'UUID', isPrimaryKey: true },
    { name: 'name', type: 'VARCHAR(200)' },
    { name: 'description', type: 'TEXT', isRequired: false },
    { name: 'start_date', type: 'DATE' },
    { name: 'end_date', type: 'DATE' },
  ], 200, 500);

  const entities = [department, position, employee, salary, leaveRequest, performance, training];

  const relationships: Relationship[] = [
    { id: generateId(), name: 'has', type: 'non-identifying', sourceEntityId: department.id, targetEntityId: position.id, sourceCardinality: '1', targetCardinality: 'M' },
    { id: generateId(), name: 'holds', type: 'non-identifying', sourceEntityId: employee.id, targetEntityId: position.id, sourceCardinality: 'M', targetCardinality: '1' },
    { id: generateId(), name: 'has', type: 'non-identifying', sourceEntityId: employee.id, targetEntityId: salary.id, sourceCardinality: '1', targetCardinality: 'M' },
    { id: generateId(), name: 'requests', type: 'non-identifying', sourceEntityId: employee.id, targetEntityId: leaveRequest.id, sourceCardinality: '1', targetCardinality: 'M' },
    { id: generateId(), name: 'receives', type: 'non-identifying', sourceEntityId: employee.id, targetEntityId: performance.id, sourceCardinality: '1', targetCardinality: 'M' },
  ];

  return {
    id: generateId(),
    name: 'HR Management Model',
    description: 'Human resources management with employees, departments, and payroll',
    targetDatabase: 'postgresql',
    notation: 'crowsfoot',
    entities,
    relationships,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function generateCRMModel(): DataModel {
  const company = createEntity('Company', 'Client companies', [
    { name: 'id', type: 'UUID', isPrimaryKey: true },
    { name: 'name', type: 'VARCHAR(200)' },
    { name: 'industry', type: 'VARCHAR(100)', isRequired: false },
    { name: 'website', type: 'VARCHAR(255)', isRequired: false },
    { name: 'size', type: 'VARCHAR(50)', isRequired: false },
  ], 50, 50);

  const contact = createEntity('Contact', 'Business contacts', [
    { name: 'id', type: 'UUID', isPrimaryKey: true },
    { name: 'company_id', type: 'UUID', isForeignKey: true },
    { name: 'first_name', type: 'VARCHAR(100)' },
    { name: 'last_name', type: 'VARCHAR(100)' },
    { name: 'email', type: 'VARCHAR(255)' },
    { name: 'phone', type: 'VARCHAR(20)', isRequired: false },
    { name: 'title', type: 'VARCHAR(100)', isRequired: false },
  ], 350, 50);

  const lead = createEntity('Lead', 'Sales leads', [
    { name: 'id', type: 'UUID', isPrimaryKey: true },
    { name: 'contact_id', type: 'UUID', isForeignKey: true },
    { name: 'source', type: 'VARCHAR(100)' },
    { name: 'status', type: 'VARCHAR(50)' },
    { name: 'assigned_to', type: 'UUID', isForeignKey: true },
    { name: 'created_at', type: 'TIMESTAMP' },
  ], 50, 250);

  const opportunity = createEntity('Opportunity', 'Sales opportunities', [
    { name: 'id', type: 'UUID', isPrimaryKey: true },
    { name: 'lead_id', type: 'UUID', isForeignKey: true, isRequired: false },
    { name: 'company_id', type: 'UUID', isForeignKey: true },
    { name: 'name', type: 'VARCHAR(200)' },
    { name: 'amount', type: 'DECIMAL(12,2)' },
    { name: 'stage', type: 'VARCHAR(50)' },
    { name: 'probability', type: 'INTEGER' },
    { name: 'close_date', type: 'DATE', isRequired: false },
  ], 350, 250);

  const activity = createEntity('Activity', 'Sales activities', [
    { name: 'id', type: 'UUID', isPrimaryKey: true },
    { name: 'contact_id', type: 'UUID', isForeignKey: true, isRequired: false },
    { name: 'opportunity_id', type: 'UUID', isForeignKey: true, isRequired: false },
    { name: 'type', type: 'VARCHAR(50)' },
    { name: 'subject', type: 'VARCHAR(255)' },
    { name: 'description', type: 'TEXT', isRequired: false },
    { name: 'due_date', type: 'TIMESTAMP', isRequired: false },
    { name: 'completed', type: 'BOOLEAN' },
  ], 200, 450);

  const deal = createEntity('Deal', 'Closed deals', [
    { name: 'id', type: 'UUID', isPrimaryKey: true },
    { name: 'opportunity_id', type: 'UUID', isForeignKey: true },
    { name: 'amount', type: 'DECIMAL(12,2)' },
    { name: 'closed_date', type: 'DATE' },
    { name: 'contract_length', type: 'INTEGER', isRequired: false },
  ], 600, 250);

  const campaign = createEntity('Campaign', 'Marketing campaigns', [
    { name: 'id', type: 'UUID', isPrimaryKey: true },
    { name: 'name', type: 'VARCHAR(200)' },
    { name: 'type', type: 'VARCHAR(50)' },
    { name: 'status', type: 'VARCHAR(50)' },
    { name: 'start_date', type: 'DATE' },
    { name: 'end_date', type: 'DATE', isRequired: false },
    { name: 'budget', type: 'DECIMAL(10,2)', isRequired: false },
  ], 450, 450);

  const entities = [company, contact, lead, opportunity, activity, deal, campaign];

  const relationships: Relationship[] = [
    { id: generateId(), name: 'has', type: 'non-identifying', sourceEntityId: company.id, targetEntityId: contact.id, sourceCardinality: '1', targetCardinality: 'M' },
    { id: generateId(), name: 'generates', type: 'non-identifying', sourceEntityId: contact.id, targetEntityId: lead.id, sourceCardinality: '1', targetCardinality: 'M' },
    { id: generateId(), name: 'converts to', type: 'non-identifying', sourceEntityId: lead.id, targetEntityId: opportunity.id, sourceCardinality: '1', targetCardinality: '1' },
    { id: generateId(), name: 'has', type: 'non-identifying', sourceEntityId: opportunity.id, targetEntityId: activity.id, sourceCardinality: '1', targetCardinality: 'M' },
    { id: generateId(), name: 'closes as', type: 'non-identifying', sourceEntityId: opportunity.id, targetEntityId: deal.id, sourceCardinality: '1', targetCardinality: '1' },
  ];

  return {
    id: generateId(),
    name: 'CRM Model',
    description: 'Customer relationship management with leads, opportunities, and deals',
    targetDatabase: 'postgresql',
    notation: 'crowsfoot',
    entities,
    relationships,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function generateBlogModel(): DataModel {
  const author = createEntity('Author', 'Blog authors', [
    { name: 'id', type: 'UUID', isPrimaryKey: true },
    { name: 'username', type: 'VARCHAR(50)', isUnique: true },
    { name: 'email', type: 'VARCHAR(255)', isUnique: true },
    { name: 'display_name', type: 'VARCHAR(100)' },
    { name: 'bio', type: 'TEXT', isRequired: false },
    { name: 'avatar_url', type: 'VARCHAR(255)', isRequired: false },
  ], 50, 50);

  const category = createEntity('Category', 'Post categories', [
    { name: 'id', type: 'UUID', isPrimaryKey: true },
    { name: 'name', type: 'VARCHAR(100)' },
    { name: 'slug', type: 'VARCHAR(100)', isUnique: true },
    { name: 'description', type: 'TEXT', isRequired: false },
  ], 350, 50, 'lookup');

  const post = createEntity('Post', 'Blog posts', [
    { name: 'id', type: 'UUID', isPrimaryKey: true },
    { name: 'author_id', type: 'UUID', isForeignKey: true },
    { name: 'category_id', type: 'UUID', isForeignKey: true },
    { name: 'title', type: 'VARCHAR(255)' },
    { name: 'slug', type: 'VARCHAR(255)', isUnique: true },
    { name: 'content', type: 'TEXT' },
    { name: 'excerpt', type: 'TEXT', isRequired: false },
    { name: 'status', type: 'VARCHAR(20)' },
    { name: 'published_at', type: 'TIMESTAMP', isRequired: false },
    { name: 'created_at', type: 'TIMESTAMP' },
  ], 200, 220);

  const comment = createEntity('Comment', 'Post comments', [
    { name: 'id', type: 'UUID', isPrimaryKey: true },
    { name: 'post_id', type: 'UUID', isForeignKey: true },
    { name: 'author_name', type: 'VARCHAR(100)' },
    { name: 'author_email', type: 'VARCHAR(255)' },
    { name: 'content', type: 'TEXT' },
    { name: 'parent_id', type: 'UUID', isForeignKey: true, isRequired: false },
    { name: 'status', type: 'VARCHAR(20)' },
    { name: 'created_at', type: 'TIMESTAMP' },
  ], 50, 450);

  const tag = createEntity('Tag', 'Content tags', [
    { name: 'id', type: 'UUID', isPrimaryKey: true },
    { name: 'name', type: 'VARCHAR(50)' },
    { name: 'slug', type: 'VARCHAR(50)', isUnique: true },
  ], 450, 220, 'lookup');

  const postTag = createEntity('PostTag', 'Post-tag associations', [
    { name: 'post_id', type: 'UUID', isPrimaryKey: true, isForeignKey: true },
    { name: 'tag_id', type: 'UUID', isPrimaryKey: true, isForeignKey: true },
  ], 400, 400, 'junction');

  const entities = [author, category, post, comment, tag, postTag];

  const relationships: Relationship[] = [
    { id: generateId(), name: 'writes', type: 'non-identifying', sourceEntityId: author.id, targetEntityId: post.id, sourceCardinality: '1', targetCardinality: 'M' },
    { id: generateId(), name: 'belongs to', type: 'non-identifying', sourceEntityId: post.id, targetEntityId: category.id, sourceCardinality: 'M', targetCardinality: '1' },
    { id: generateId(), name: 'has', type: 'non-identifying', sourceEntityId: post.id, targetEntityId: comment.id, sourceCardinality: '1', targetCardinality: 'M' },
    { id: generateId(), name: 'tagged with', type: 'identifying', sourceEntityId: post.id, targetEntityId: postTag.id, sourceCardinality: '1', targetCardinality: 'M' },
    { id: generateId(), name: 'tags', type: 'identifying', sourceEntityId: tag.id, targetEntityId: postTag.id, sourceCardinality: '1', targetCardinality: 'M' },
  ];

  return {
    id: generateId(),
    name: 'Blog Platform Model',
    description: 'Blog platform with posts, authors, categories, and comments',
    targetDatabase: 'postgresql',
    notation: 'crowsfoot',
    entities,
    relationships,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Placeholder implementations for remaining templates
function generateInventoryModel(): DataModel {
  return generateEcommerceModel(); // Simplified - would be customized
}

function generateSocialModel(): DataModel {
  return generateBlogModel(); // Simplified - would be customized
}

function generateSchoolModel(): DataModel {
  return generateHRModel(); // Simplified - would be customized
}

function generateHospitalModel(): DataModel {
  return generateCRMModel(); // Simplified - would be customized
}
