/**
 * Database Contract untuk tabel Customer dan CustomerType.
 */
export const CustomerContract = {
  TABLE_NAME: 'customer',
  Columns: {
    CUSTOMER_ID: 'customer_id',
    CUSTOMER_NAME: 'customer_name',
    CUSTOMER_DISC: 'customer_disc',
    CUSTOMER_DISC_DATESTART: 'customer_disc_datestart',
    CUSTOMER_DISC_DATEEND: 'customer_disc_dateend',
    CUSTOMERTYPE_ID: 'customertype_id',
    CUSTOMER_GENDER: 'customer_gender',
    CUSTOMER_BIRTHDATE: 'customer_birthdate',
    CUSTOMER_ISDISABLED: 'customer_isdisabled',
    DATATIMESTAMP: 'datatimestamp'
  }
};

export const CustomerTypeContract = {
  TABLE_NAME: 'customertype',
  Columns: {
    CUSTOMERTYPE_ID: 'customertype_id',
    CUSTOMERTYPE_NAME: 'customertype_name'
  }
};
