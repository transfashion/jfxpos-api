import { CustomerRepository } from '../src/repositories/customerRepository.js';

async function test() {
  try {
    console.log('Mengambil data Customer ID 81234567802...');
    const customer = await CustomerRepository.findById(81234567802);
    
    if (customer) {
      console.log('Detail Customer Ditemukan:');
      console.log(JSON.stringify(customer, null, 2));
    } else {
      console.log('Customer tidak ditemukan.');
    }
  } catch (error) {
    console.error('Error saat testing:', error);
  } finally {
    process.exit();
  }
}

test();
