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
    $scope.paginaInformada = 1; // página digitada pelo usuário
    $scope.usuarios = [];
    $scope.camposBusca = [
                          {
                            id: $campos.administracao.webpagesusers.ds_email,
                            ativo: true,  
                            nome: "E-mail"
                          },{
                            id: $campos.administracao.webpagesusers.ds_login,
                            ativo: true,
                            nome: "Login"
                          },{
                            id: $campos.administracao.webpagesusers.grupo_empresa + ($campos.cliente.grupoempresa.ds_nome - 100), 
                            //id: $campos.administracao.webpagesusers.id_grupo,
                            ativo : !$scope.grupoempresa, // é desativado quando o $scope.grupoempresa !== undefined
                            nome: "Empresa"
                          },{
                            id: $campos.administracao.webpagesusers.empresa + ($campos.cliente.empresa.ds_fantasia - 100), 
                            //id: $campos.administracao.webpagesusers.nu_cnpjEmpresa,
                            ativo: true,
                            nome: "Filial"
                          },
                         ];
    $scope.itens_pagina = [10, 20, 50, 100];
    $scope.usuario = {busca:'', campo_busca : $scope.camposBusca[0], 
                      itens_pagina : $scope.itens_pagina[0], pagina : 1,
                      total_registros : 0, total_paginas : 0, 
                      campo_ordenacao : {id: $campos.administracao.webpagesusers.ds_email, order : 0}};
                                                
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
      * Modifica a ordenação
      */
    var ordena = function(posCampo){
        if(posCampo >= 0 && posCampo < $scope.camposBusca.length){
            if($scope.usuario.campo_ordenacao.id !== $scope.camposBusca[posCampo].id){ 
                $scope.usuario.campo_ordenacao.id = $scope.camposBusca[posCampo].id;
                $scope.usuario.campo_ordenacao.order = 0; // começa descendente                                 
            }else
                // Inverte a ordenação: ASCENDENTE => DESCENDENTE e vice-versa                                
                $scope.usuario.campo_ordenacao.order = $scope.usuario.campo_ordenacao.order === 0 ? 1 : 0;                                
            $scope.buscaUsuarios(); 
        }
    };
    /**
      * Ordena por e-mail. 
      * Se já estava ordenando por e-mail, inverte a forma de ordenação
      */
    $scope.ordenaPorEmail = function(){
        ordena(0);
    };
    /**
      * Ordena por login. 
      * Se já estava ordenando por login, inverte a forma de ordenação
      */
    $scope.ordenaPorLogin = function(){
        ordena(1);
    };
    /**
      * Ordena por grupo empresa. 
      * Se já estava ordenando por grupo empresa, inverte a forma de ordenação
      */
    $scope.ordenaPorGrupoEmpresa = function(){
        ordena(2);
    }; 
    /**
      * Ordena por empresa. 
      * Se já estava ordenando por empresa, inverte a forma de ordenação
      */
    $scope.ordenaPorEmpresa = function(){
        ordena(3);
    };
    /**
      * Retorna true se a ordenação está sendo feito por login de forma crescente
      */
    $scope.estaOrdenadoCrescentePorLogin = function(){
        return $scope.usuario.campo_ordenacao.id == $scope.camposBusca[0].id && 
               $scope.usuario.campo_ordenacao.order == 0;    
    };
    /**
      * Retorna true se a ordenação está sendo feito por login de forma decrescente
      */
    $scope.estaOrdenadoDecrescentePorLogin = function(){
        return $scope.usuario.campo_ordenacao.id == $scope.camposBusca[0].id && 
               $scope.usuario.campo_ordenacao.order == 1;    
    };                                          
    /**
      * Retorna true se a ordenação está sendo feito por e-mail de forma crescente
      */
    $scope.estaOrdenadoCrescentePorEmail = function(){
        return $scope.usuario.campo_ordenacao.id === $scope.camposBusca[1].id && 
               $scope.usuario.campo_ordenacao.order === 0;    
    };
    /**
      * Retorna true se a ordenação está sendo feito por e-mail de forma decrescente
      */
    $scope.estaOrdenadoDecrescentePorEmail = function(){
        return $scope.usuario.campo_ordenacao.id === $scope.camposBusca[1].id && 
               $scope.usuario.campo_ordenacao.order === 1;    
    };                                         
    /**
      * Retorna true se a ordenação está sendo feito por grupo empresa de forma crescente
      */
    $scope.estaOrdenadoCrescentePorGrupoEmpresa = function(){
        return $scope.usuario.campo_ordenacao.id === $scope.camposBusca[2].id && 
               $scope.usuario.campo_ordenacao.order === 0;    
    };
    /**
      * Retorna true se a ordenação está sendo feito por grupo empresa de forma decrescente
      */
    $scope.estaOrdenadoDecrescentePorGrupoEmpresa = function(){
        return $scope.usuario.campo_ordenacao.id === $scope.camposBusca[2].id && 
               $scope.usuario.campo_ordenacao.order === 1;    
    }; 
    /**
      * Retorna true se a ordenação está sendo feito por empresa de forma crescente
      */
    $scope.estaOrdenadoCrescentePorEmpresa = function(){
        return $scope.usuario.campo_ordenacao.id === $scope.camposBusca[3].id && 
               $scope.usuario.campo_ordenacao.order === 0;    
    };
    /**
      * Retorna true se a ordenação está sendo feito por empresa de forma decrescente
      */
    $scope.estaOrdenadoDecrescentePorEmpresa = function(){
        return $scope.usuario.campo_ordenacao.id === $scope.camposBusca[3].id && 
               $scope.usuario.campo_ordenacao.order === 1;    
    };                                          
                                            
                                            
                                                
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.usuario.total_paginas){ 
           $scope.usuario.pagina = pagina;
           $scope.buscaUsuarios(); 
       }
       $scope.atualizaPaginaDigitada();    
    };
    /**
      * Vai para a página anterior
      */
    $scope.retrocedePagina = function(){
        setPagina($scope.usuario.pagina - 1); 
    };
    /**
      * Vai para a página seguinte
      */                                            
    $scope.avancaPagina = function(){
        setPagina($scope.usuario.pagina + 1); 
    };
    /**
      * Foi informada pelo usuário uma página para ser exibida
      */                                            
    $scope.alteraPagina = function(){
        if($scope.paginaInformada) setPagina(parseInt($scope.paginaInformada));
        else $scope.setaPaginaDigitada();  
    };
    /**
      * Sincroniza a página digitada com a que efetivamente está sendo exibida
      */                                            
    $scope.atualizaPaginaDigitada = function(){
        $scope.paginaInformada = $scope.usuario.pagina; 
    };                                             
    /**
      * Notifica que o total de itens por página foi alterado
      */                                            
    $scope.alterouItensPagina = function(){
        $scope.buscaUsuarios();   
    };
     
    // BUSCA
    $scope.buscaUsuarios = function(){
       $scope.showAlert('Obtendo usuários'); // exibe o alert
        
       var filtros = undefined;
       
       // Só considera busca de filtro a partir de três caracteres    
       if($scope.usuario.busca.length > 0) filtros = {id: $scope.usuario.campo_busca.id, valor: '%' + $scope.usuario.busca + '%'};        
       // Filtro do grupo empresa => barra administrativa
       if($scope.grupoempresa){
            var filtroGrupoEmpresa = {id: $campos.administracao.webpagesusers.id_grupo, valor: $scope.grupoempresa.id_grupo};
            if(filtros) filtros = [filtros, filtroGrupoEmpresa];
            else filtros = filtroGrupoEmpresa;
       }
        
       $scope.obtendoUsuarios = true;
       var dadosAPI = $webapi.get($apis.administracao.webpagesusers, [token, 2, $scope.usuario.campo_ordenacao.id, 
                                                                     $scope.usuario.campo_ordenacao.order, 
                                                                     $scope.usuario.itens_pagina, $scope.usuario.pagina],
                                  filtros); 
       dadosAPI.then(function(dados){
                $scope.usuarios = dados.Registros;
                $scope.usuario.total_registros = dados.TotalDeRegistros;
                $scope.usuario.total_paginas = Math.ceil($scope.usuario.total_registros / $scope.usuario.itens_pagina);
                $scope.obtendoUsuarios = false;
                $scope.hideAlert(); // fecha o alert
                // Verifica se a página atual é maior que o total de páginas
                if($scope.usuario.pagina > $scope.usuario.total_paginas)
                    setPagina(1); // volta para a primeira página e refaz a busca
              },
              function(failData){
                 //console.log("FALHA AO OBTER USUARIOS: " + failData.status);
                 $scope.obtendoUsuarios = false;
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else $scope.showAlert('Houve uma falha ao requisitar usuários (' + failData.status + ')', true, 'danger', true);
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
      * Editar usuario => Abre tela de cadastro, enviando como parâmetro o objeto usuario
      */
    $scope.editarUsuario = function(usuario){
        $scope.goAdministrativoUsuariosCadastro({usuario:usuario});
    }; 
    /**
      * Excluir usuario
      */
    $scope.exluirUsuario = function(usuario){
        if(confirm("Tem certeza que deseja excluir " + usuario.ds_email)){
            // Deleta
            $scope.showAlert('Deletando usuário'); // exibe o alert
            $webapi.delete($apis.administracao.webpagesusers, 
                           [{id: 'token', valor: token},{id: 'id_users', valor: usuario.id_users}]) 
                .then(function(dados){
                    alert('Usuário deletado com sucesso');
                    $scope.hideAlert(); // fecha o alert
                  },
                  function(failData){
                     //console.log("FALHA AO DELETAR USUARIO: " + failData.status);
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else $scope.showAlert('Houve uma falha ao requisitar usuários (' + failData.status + ')', true, 'danger', true);
                  }); 
        }
    };                                               

}])