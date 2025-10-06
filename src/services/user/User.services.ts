import UserRepository from "@db/entities/user/User.repository.js"

export const getUserById = async (id: string) => {
    const user = await UserRepository.findOne({
        where: { id }
    })

    return user ? user : null
}