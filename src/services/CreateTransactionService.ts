import { getRepository, getCustomRepository } from 'typeorm';
import Category from '../models/Category';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute(data: Request): Promise<Transaction> {
    // TODO
    const { category, title, type, value } = data;

    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const { total } = await transactionsRepository.getBalance();
    if (total - value < 0 && type === 'outcome') {
      throw new AppError(`You don't have money to put it!`);
    }
    let foundCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!foundCategory) {
      foundCategory = categoriesRepository.create({ title: category });
      await categoriesRepository.save(foundCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: foundCategory.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
