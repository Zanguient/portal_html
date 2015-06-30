/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("administrativo-usuarios", ['servicos']) 

.controller("administrativo-usuariosCtrl", ['$scope',
                                            '$state',
                                            '$http',
                                            '$campos',
                                            '$webapi',
                                            '$apis',
                                            '$filter',
                                            '$autenticacao', 
                                            function($scope,$state,$http,$campos,
                                                     $webapi,$apis,$filter,$autenticacao){ 
    var token = '';
    $scope.usuarios = [];
    $scope.camposBusca = [
                          {
                            id: $campos.administracao.webpageusers.ds_email,
                            ativo: true,  
                            nome: "E-mail"
                          },{
                            id: $campos.administracao.webpageusers.ds_login,
                            ativo: true,
                            nome: "Login"
                          },{
                            id: $campos.administracao.webpageusers.id_grupo,
                            ativo : !$scope.grupoempresa, // é desativado quando o $scope.grupoempresa !== undefined
                            nome: "Empresa"
                          },{
                            id: $campos.administracao.webpageusers.nu_cnpjEmpresa,
                            ativo: true,
                            nome: "Filial"
                          },
                         ];
    $scope.itens_pagina = [10, 20, 50, 100];
    $scope.usuario = {busca:'', campo_busca : $scope.camposBusca[0], 
                      itens_pagina : $scope.itens_pagina[0], pagina : 1,
                      total_registros : 0, total_paginas : 0, 
                      campo_ordenacao : {id: $campos.administracao.webpageusers.ds_email, order : 0}};
                                                
    // Inicialização do controller
    $scope.administrativoUsuariosInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Gestão de Acessos';                          
        $scope.pagina.subtitulo = 'Usuários';
        // Token
        token = $autenticacao.getToken();
        // Busca Usuários
        $scope.buscaUsuarios();
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){
            // Modifica a visibilidade do campo de busca para o grupo empresa
            $scope.camposBusca[2].ativo = !$scope.grupoempresa;   
            // Refaz a busca
            $scope.buscaUsuarios();
        });   
    }; 
                                            
    // ORDENAÇÃO
    /**
      * Ordena por e-mail. 
      * Se já estava ordenando por e-mail, inverte a forma de ordenação
      */
    $scope.ordenaPorEmail = function(){
        if($scope.usuario.campo_ordenacao.id !== $campos.administracao.webpageusers.ds_email){ 
            $scope.usuario.campo_ordenacao.id = $campos.administracao.webpageusers.ds_email;
            $scope.usuario.campo_ordenacao.order = 0; // começa descendente                                 
        }else
            // Inverte a ordenação: ASCENDENTE => DESCENDENTE e vice-versa                                
            $scope.usuario.campo_ordenacao.order = $scope.usuario.campo_ordenacao.order === 0 ? 1 : 0;                                
        $scope.buscaUsuarios();
    };
    /**
      * Ordena por login. 
      * Se já estava ordenando por login, inverte a forma de ordenação
      */
    $scope.ordenaPorLogin = function(){
        if($scope.usuario.campo_ordenacao.id !== $campos.administracao.webpageusers.ds_login){ 
            $scope.usuario.campo_ordenacao.id = $campos.administracao.webpageusers.ds_login;
            $scope.usuario.campo_ordenacao.order = 0; // começa descendente                                 
        }else
            // Inverte a ordenação: ASCENDENTE => DESCENDENTE e vice-versa                                
            $scope.usuario.campo_ordenacao.order = $scope.usuario.campo_ordenacao.order === 0 ? 1 : 0;                                
        $scope.buscaUsuarios();
    };
    /**
      * Ordena por grupo empresa. 
      * Se já estava ordenando por grupo empresa, inverte a forma de ordenação
      */
    $scope.ordenaPorGrupoEmpresa = function(){
        if($scope.usuario.campo_ordenacao.id !== $campos.administracao.webpageusers.id_grupo){ 
            $scope.usuario.campo_ordenacao.id = $campos.administracao.webpageusers.id_grupo;
            $scope.usuario.campo_ordenacao.order = 0; // começa descendente                                 
        }else
            // Inverte a ordenação: ASCENDENTE => DESCENDENTE e vice-versa                                
            $scope.usuario.campo_ordenacao.order = $scope.usuario.campo_ordenacao.order === 0 ? 1 : 0;                                
        $scope.buscaUsuarios();
    }; 
    /**
      * Ordena por empresa. 
      * Se já estava ordenando por empresa, inverte a forma de ordenação
      */
    $scope.ordenaPorEmpresa = function(){
        if($scope.usuario.campo_ordenacao.id !== $campos.administracao.webpageusers.nu_cnpjEmpresa){ 
            $scope.usuario.campo_ordenacao.id = $campos.administracao.webpageusers.nu_cnpjEmpresa;
            $scope.usuario.campo_ordenacao.order = 0; // começa descendente                                 
        }else
            // Inverte a ordenação: ASCENDENTE => DESCENDENTE e vice-versa                                
            $scope.usuario.campo_ordenacao.order = $scope.usuario.campo_ordenacao.order === 0 ? 1 : 0;                                
        $scope.buscaUsuarios();
    };
    /**
      * Retorna true se a ordenação está sendo feito por login de forma crescente
      */
    $scope.estaOrdenadoCrescentePorLogin = function(){
        return $scope.usuario.campo_ordenacao.id == $campos.administracao.webpageusers.ds_login && 
               $scope.usuario.campo_ordenacao.order == 0;    
    };
    /**
      * Retorna true se a ordenação está sendo feito por login de forma decrescente
      */
    $scope.estaOrdenadoDecrescentePorLogin = function(){
        return $scope.usuario.campo_ordenacao.id == $campos.administracao.webpageusers.ds_login && 
               $scope.usuario.campo_ordenacao.order == 1;    
    };                                          
    /**
      * Retorna true se a ordenação está sendo feito por e-mail de forma crescente
      */
    $scope.estaOrdenadoCrescentePorEmail = function(){
        return $scope.usuario.campo_ordenacao.id === $campos.administracao.webpageusers.ds_email && 
               $scope.usuario.campo_ordenacao.order === 0;    
    };
    /**
      * Retorna true se a ordenação está sendo feito por e-mail de forma decrescente
      */
    $scope.estaOrdenadoDecrescentePorEmail = function(){
        return $scope.usuario.campo_ordenacao.id === $campos.administracao.webpageusers.ds_email && 
               $scope.usuario.campo_ordenacao.order === 1;    
    };                                         
    /**
      * Retorna true se a ordenação está sendo feito por grupo empresa de forma crescente
      */
    $scope.estaOrdenadoCrescentePorGrupoEmpresa = function(){
        return $scope.usuario.campo_ordenacao.id === $campos.administracao.webpageusers.id_grupo && 
               $scope.usuario.campo_ordenacao.order === 0;    
    };
    /**
      * Retorna true se a ordenação está sendo feito por grupo empresa de forma decrescente
      */
    $scope.estaOrdenadoDecrescentePorGrupoEmpresa = function(){
        return $scope.usuario.campo_ordenacao.id === $campos.administracao.webpageusers.id_grupo && 
               $scope.usuario.campo_ordenacao.order === 1;    
    }; 
    /**
      * Retorna true se a ordenação está sendo feito por empresa de forma crescente
      */
    $scope.estaOrdenadoCrescentePorEmpresa = function(){
        return $scope.usuario.campo_ordenacao.id === $campos.administracao.webpageusers.nu_cnpjEmpresa && 
               $scope.usuario.campo_ordenacao.order === 0;    
    };
    /**
      * Retorna true se a ordenação está sendo feito por empresa de forma decrescente
      */
    $scope.estaOrdenadoDecrescentePorEmpresa = function(){
        return $scope.usuario.campo_ordenacao.id === $campos.administracao.webpageusers.nu_cnpjEmpresa && 
               $scope.usuario.campo_ordenacao.order === 1;    
    };                                          
                                            
                                            
                                                
    // PAGINAÇÃO
    $scope.retrocedePagina = function(){
        if($scope.usuario.pagina > 1){ 
            $scope.usuario.pagina--;  
            $scope.buscaUsuarios();
        }
    };
    $scope.avancaPagina = function(){
        if($scope.usuario.pagina < $scope.usuario.total_paginas){ 
            $scope.usuario.pagina++; 
            $scope.buscaUsuarios();
        }
    };
    $scope.alterouItensPagina = function(){
        $scope.buscaUsuarios();   
    };
     
    // BUSCA
    $scope.buscaUsuarios = function(){
       $scope.showAlertProgress(); // exibe o alert
        
       var filtros = undefined;
       
       // Só considera busca de filtro a partir de três caracteres    
       if($scope.usuario.busca.length > 0) filtros = {id: $scope.usuario.campo_busca.id, valor: '%' + $scope.usuario.busca + '%'};        
       // Filtro do grupo empresa => barra administrativa
       if($scope.grupoempresa){
            var filtroGrupoEmpresa = {id: $campos.administracao.webpageusers.id_grupo, valor: $scope.grupoempresa.id_grupo};
            if(filtros) filtros = [filtros, filtroGrupoEmpresa];
            else filtros = filtroGrupoEmpresa;
       }
        
       $scope.obtendoUsuarios = true;
       var dadosAPI = $webapi.get($apis.administracao.webpageusers, [token, 0, $scope.usuario.campo_ordenacao.id, 
                                                                     $scope.usuario.campo_ordenacao.order, 
                                                                     $scope.usuario.itens_pagina, $scope.usuario.pagina],
                                  filtros); 
       dadosAPI.then(function(dados){
                $scope.usuarios = dados.Registros;
                $scope.usuario.total_registros = dados.TotalDeRegistros;
                $scope.usuario.total_paginas = Math.ceil($scope.usuario.total_registros / $scope.usuario.itens_pagina);
                $scope.obtendoUsuarios = false;
                $scope.hideAlertProgress(); // fecha o alert
              },
              function(failData){
                 console.log("FALHA AO OBTER USUARIOS: " + failData.status);
                 $scope.obtendoUsuarios = false;
                 $scope.hideAlertProgress(); // fecha o alert
              }); 
    };
                                                
                                                
                                                
    // AÇÕES
    /**
      * Redefinir senha
      */
    $scope.resetarSenhaDoUsuario = function(usuario){
        if(confirm("Tem certeza que deseja resetar a senha de " + usuario.ds_email)){
            // Envia post para deletar
            console.log("RESETANDO A SENHA DO USUARIO " + usuario.ds_email + "(" + usuario.id_users + ")");
        }
    };
    /**
      * Editar usuario
      */
    $scope.editarUsuario = function(usuario){
        $scope.goAdministrativoUsuariosCadastro({usuario:usuario});
    }; 
    /**
      * Excluir usuario
      */
    $scope.exluirUsuario = function(usuario){
        if(confirm("Tem certeza que deseja excluir " + usuario.ds_email)){
            // Envia post para deletar
            console.log("EXCLUINDO USUARIO " + usuario.ds_email + "(" + usuario.id_users + ")");
        }
    };                                               

}])