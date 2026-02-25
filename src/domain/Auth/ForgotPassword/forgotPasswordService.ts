import {forgotPasswordAPI} from './forgotPasswordAPI';

async function execute(email: string): Promise<unknown> {
  return forgotPasswordAPI.execute({email});
}

export const forgotPasswordService = {
  execute,
};
