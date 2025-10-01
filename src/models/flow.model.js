const flow = {
  id: String,          // uuid v4
  userId: String,      // requerido
  flow: String,        // requerido
  step: String,        // requerido
  flowData: Object,    // default: {}
  created_at: Date,    // server-managed
  updated_at: Date     // server-managed
};

module.exports = { flow };