package com.antonela.art.dto;

import com.antonela.art.entity.Cliente;
import com.antonela.art.entity.UsuarioAdmin;

public record AuthResponse(
    String token,
    Cliente cliente,
    UsuarioAdmin usuarioAdmin
) {}
