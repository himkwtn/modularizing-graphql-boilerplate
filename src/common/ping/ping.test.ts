import { ISignupArgs } from '@src/auth/auth.interfaces';
import { graphqlServer } from '@src/server';
import { getUserBearerToken, mockUserArgs, requestGql } from '@src/test-utils';
import { createTestUserIfNotExist } from '@src/test-utils';
import { graphql } from 'graphql';

let token: string;

const email = 'ping@gmail.com';
const signupArgs: ISignupArgs = {
	...mockUserArgs,
	email
};

beforeAll(async () => {
	await createTestUserIfNotExist(signupArgs);
	token = await getUserBearerToken({ email });
});

test('ping', async () => {
	expect.assertions(1);
	const gql = `
	    query {
	        ping
	    }
	`;

	await requestGql(gql).expect(res => {
		expect(res.body.data).toEqual({ ping: 'pong' });
	});
});

test('pingAuthenticated', async () => {
	expect.assertions(1);
	const gql = `
	    query {
	        pingAuthenticated
	    }
	`;

	await requestGql(gql)
		.set('Authorization', token)
		.expect(res => {
			expect(res.body.data).toEqual({ pingAuthenticated: 'pong' });
		});
});

test('pingAuthenticated without supertest', async () => {
	expect.assertions(1);
	const gql = `
	    query {
	        pingAuthenticated
	    }
	`;

	const response = await graphql(graphqlServer.executableSchema, gql, null, {
		request: { headers: { authorization: token } },
		db: { exists: { User: jest.fn().mockReturnValue(true) } }
	});

	expect(response.data).toEqual({ pingAuthenticated: 'pong' });
});
